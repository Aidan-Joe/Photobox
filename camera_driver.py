import os
import sys
import time
import traceback
from threading import Thread, Lock
from http.server import HTTPServer, BaseHTTPRequestHandler

# Configure libusb-package DLL search path for Windows
try:
    import libusb_package
    lib_path = os.path.dirname(libusb_package.__file__)
    if os.path.isdir(lib_path):
        os.environ['PATH'] = lib_path + os.pathsep + os.environ.get('PATH', '')
        if hasattr(os, 'add_dll_directory'):
            os.add_dll_directory(lib_path)
except Exception as e:
    pass

# Patch collections module for Python 3.10+ compatibility (since ptpy uses old names)
import collections
import collections.abc
collections.Sequence = collections.abc.Sequence
collections.Mapping = collections.abc.Mapping
collections.MutableMapping = collections.abc.MutableMapping
collections.Iterable = collections.abc.Iterable

# Monkey-patch usb.core.Device.reset to bypass Windows USB permission restrictions
import usb.core
def dummy_reset(self):
    pass
usb.core.Device.reset = dummy_reset

from ptpy import PTPy
from ptpy.extensions.canon import Canon
from ptpy.ptp import Container

PORT = 5515
OUTPUT_DIR = "C:\\digiCamControl"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Shared camera state and locks
camera = None
camera_lock = Lock()
is_liveview_active = False

def init_camera():
    global camera
    try:
        print("[Camera Driver] Connecting to Canon DSLR via USB PTP...")
        # Force Session ID reset by instantiating PTPy and checking session
        camera = PTPy(extension=Canon)
        print("Connected successfully!")
        
        # Reset internal session state in ptpy to force SessionID = 1 on open_session
        camera._session = 0
        
        print("[Camera Driver] Opening standard PTP session...")
        camera.open_session()
        print("[Camera Driver] Session opened successfully.")
        
        # Canon EOS Remote Control initialization sequence
        print("[Camera Driver] Activating EOS Remote Mode (0x9114)...")
        camera.eos_remote_control(1)
        
        print("[Camera Driver] Activating EOS Event Mode (0x9115)...")
        camera.eos_set_event_mode(1)
        
        # Send HDD capacity (0x911A) to trick the camera into allowing PC storage
        print("[Camera Driver] Sending EOSPCHDDCapacity (0x911a)...")
        ptp_hdd = Container(
            OperationCode=0x911a,
            SessionID=camera._session,
            TransactionID=camera._transaction,
            Parameter=[0x00100000, 0x00000001, 0x00000000]
        )
        camera.mesg(ptp_hdd)
        time.sleep(0.2)
        
        # Clear initial property event queue flood (takes ~3s)
        print("[Camera Driver] Clearing initial event queue...")
        start_poll = time.time()
        while time.time() - start_poll < 3.0:
            camera.event()
            time.sleep(0.1)
            
        # Enable Live View (EVF)
        enable_liveview()
    except Exception as e:
        print("[Camera Driver] Failed to initialize camera:", e)
        traceback.print_exc()

def enable_liveview():
    global is_liveview_active
    with camera_lock:
        try:
            print("[Camera Driver] Activating camera Live View (EVF)...")
            
            # Step 1: Initiate Viewfinder (0x9151)
            ptp_init = Container(
                OperationCode=0x9151,
                SessionID=camera._session,
                TransactionID=camera._transaction,
                Parameter=[]
            )
            camera.mesg(ptp_init)
            time.sleep(0.2)
            
            # Step 2: Set EVFOutputDevice (0xD109) to 1 (PC) using raw PTP send (bypassing broken PTPy helper)
            ptp_evf = Container(
                OperationCode=0x1016, # SetDevicePropValue
                SessionID=camera._session,
                TransactionID=camera._transaction,
                Parameter=[0xD109]
            )
            camera.send(ptp_evf, b'\x00\x00\x00\x01')
            time.sleep(0.5) # Wait for mirror to flip up and sensor to stabilize
            
            is_liveview_active = True
            print("[Camera Driver] Live View active.")
        except Exception as e:
            print("[Camera Driver] Failed to activate Live View:", e)
            traceback.print_exc()

def disable_liveview():
    global is_liveview_active
    with camera_lock:
        try:
            print("[Camera Driver] Deactivating camera Live View (EVF)...")
            
            # Step 1: Set EVFOutputDevice (0xD109) to 0 (Off) using raw PTP send (bypassing broken PTPy helper)
            ptp_evf = Container(
                OperationCode=0x1016, # SetDevicePropValue
                SessionID=camera._session,
                TransactionID=camera._transaction,
                Parameter=[0xD109]
            )
            camera.send(ptp_evf, b'\x00\x00\x00\x00')
            time.sleep(0.2)
            
            # Step 2: Terminate Viewfinder (0x9152)
            ptp_term = Container(
                OperationCode=0x9152,
                SessionID=camera._session,
                TransactionID=camera._transaction,
                Parameter=[]
            )
            camera.mesg(ptp_term)
            
            is_liveview_active = False
            print("[Camera Driver] Live View deactivated.")
        except Exception as e:
            print("[Camera Driver] Failed to deactivate Live View:", e)
            traceback.print_exc()

def trigger_capture():
    global is_liveview_active
    
    # 1. Turn off Live View before capturing (Canon requires this to free the sensor mirror)
    if is_liveview_active:
        disable_liveview()
        time.sleep(0.5) # Wait for mirror to drop
        
    with camera_lock:
        try:
            print("[Camera Driver] Querying file handles before capture...")
            handles_before = list(camera.get_object_handles(storage_id=0xFFFFFFFF))
            print(f"[Camera Driver] Total files on SD card before: {len(handles_before)}")
            
            print("[Camera Driver] Triggering shutter (Half-Press -> Full-Press)...")
            try:
                camera.eos_reset_ui_lock()
            except:
                pass
                
            # Step 1: Half-Press (Focus/Metering)
            camera.eos_remote_release_on(full=False, m=False)
            time.sleep(0.5)
            
            # Step 2: Full-Press (Capture)
            camera.eos_remote_release_on(full=True, m=False)
            time.sleep(0.5)
            
            # Step 3: Release Shutter Button
            camera.eos_remote_release_off(full=True, m=False)
            camera.eos_remote_release_off(full=False, m=False)
            print("[Camera Driver] Shutter release complete.")
            
            print("[Camera Driver] Waiting 3 seconds for photo to save to SD card...")
            time.sleep(3.0)
            
            print("[Camera Driver] Querying file handles after capture...")
            handles_after = list(camera.get_object_handles(storage_id=0xFFFFFFFF))
            print(f"[Camera Driver] Total files on SD card after: {len(handles_after)}")
            
            new_handles = list(set(handles_after) - set(handles_before))
            print("[Camera Driver] New file handles found:", new_handles)
            
            if new_handles:
                new_handle = new_handles[0]
                print(f"[Camera Driver] Downloading new image (Handle ID: {new_handle})...")
                obj_data = camera.get_object(new_handle)
                
                # Save to C:\digiCamControl with a unique name
                filename = f"cuitbox_ptpy_{int(time.time() * 1000)}.jpg"
                filepath = os.path.join(OUTPUT_DIR, filename)
                with open(filepath, 'wb') as f:
                    f.write(obj_data.Data)
                print(f"[Camera Driver] Photo successfully saved to: {filepath}")
                
                # Reactivate Live View
                Thread(target=enable_liveview).start()
                return {"status": "success", "filename": filename, "filepath": filepath}
            else:
                print("[Camera Driver] Error: No new file detected on SD card.")
                # Try to reactivate Live View even if capture failed
                Thread(target=enable_liveview).start()
                return {"status": "error", "message": "No new file detected on SD card."}
        except Exception as e:
            print("[Camera Driver] Exception during capture:", e)
            traceback.print_exc()
            # Try to reactivate Live View in case of failure
            Thread(target=enable_liveview).start()
            return {"status": "error", "message": str(e)}

class CameraDriverHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global camera, is_liveview_active
        
        # Handle CORS
        self.send_response_only = False
        
        if self.path == '/live':
            # Stream Live View MJPEG
            self.send_response(200)
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=frame')
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0')
            self.send_header('Connection', 'close')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            print("[Camera Driver] Client connected to Live View stream.")
            
            consecutive_failures = 0
            try:
                while True:
                    # If Live View was temporarily deactivated for capture, wait for it
                    if not is_liveview_active:
                        time.sleep(0.1)
                        continue
                        
                    frame_data = None
                    with camera_lock:
                        try:
                            # Fetch frame from camera EVF
                            frame = camera.eos_get_viewfinder_image()
                            if hasattr(frame, 'Data') and len(frame.Data) > 0:
                                frame_data = frame.Data
                                consecutive_failures = 0
                        except Exception as frame_err:
                            consecutive_failures += 1
                            print(f"[Camera Driver] Live View frame read failed ({consecutive_failures}): {frame_err}")
                            if consecutive_failures >= 5:
                                print("[Camera Driver] 5 consecutive failures. Attempting to re-enable Live View...")
                                try:
                                    # Send raw PTP to re-enable EVFOutputDevice
                                    ptp_evf = Container(
                                        OperationCode=0x1016, # SetDevicePropValue
                                        SessionID=camera._session,
                                        TransactionID=camera._transaction,
                                        Parameter=[0xD109]
                                    )
                                    camera.send(ptp_evf, b'\x00\x00\x00\x01')
                                except Exception as re_err:
                                    print("[Camera Driver] Re-enable failed:", re_err)
                                consecutive_failures = 0
                            time.sleep(0.5) # Prevent tight loop on timeouts
                            
                    if frame_data:
                        # Write MJPEG frame boundary
                        self.wfile.write(b'--frame\r\n')
                        self.wfile.write(b'Content-Type: image/jpeg\r\n')
                        self.wfile.write(f"Content-Length: {len(frame_data)}\r\n\r\n".encode())
                        self.wfile.write(frame_data)
                        self.wfile.write(b'\r\n')
                    else:
                        time.sleep(0.03) # Limit frame rate if no data
            except Exception as stream_err:
                print("[Camera Driver] Client disconnected from Live View stream.")
                
        elif '/?CMD=CaptureNoAf' in self.path or 'CMD=Capture' in self.path:
            # Trigger physical capture
            print("[Camera Driver] Capture request received.")
            result = trigger_capture()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Respond in JSON format
            import json
            self.wfile.write(json.dumps(result).encode())
            
        else:
            # Default response
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b"Cuitbox Python DSLR PTP Driver is Running.")

    def do_OPTIONS(self):
        # Support CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

def run_server():
    server = HTTPServer(('127.0.0.1', PORT), CameraDriverHandler)
    print(f"[Camera Driver] HTTP Server running on http://127.0.0.1:{PORT}")
    server.serve_forever()

if __name__ == '__main__':
    # Initialize connection to DSLR
    init_camera()
    
    # Start HTTP server
    run_server()
