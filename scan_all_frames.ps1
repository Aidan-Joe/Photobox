Add-Type -AssemblyName System.Drawing

$framesDir = 'C:\Users\khanza haura\photobox_ci4\public\uploads\frames'
$outputJson = 'C:\Users\khanza haura\.gemini\antigravity-ide\brain\a3c55e86-54de-4a22-8cb8-e85307778368\frame_layouts.json'

$dbFrames = @(
    @{ id='FRM-001'; path='1782668422_23d3e1edad5ee64f449b.png' }
    @{ id='FRM-002'; path='1782668563_a94ed0c06a4ea1075ad0.png' }
    @{ id='FRM-003'; path='1782668611_485e4ebb4955b38c371f.png' }
    @{ id='FRM-004'; path='1782668658_7071ba577713f8ea05fd.png' }
    @{ id='FRM-007'; path='1782669626_7f0868bd3250c300bdf0.png' }
    @{ id='FRM-008'; path='1782671015_1f1e6294d75bb78b28a5.png' }
    @{ id='FRM-009'; path='1782671104_bf8e7a4237d9fd77c8a6.png' }
    @{ id='FRM-010'; path='1782671157_80f121bbb039b3a92e1a.png' }
    @{ id='FRM-011'; path='1782671207_ee8ad85da404b9b287ce.png' }
    @{ id='FRM-012'; path='1782671250_f880a7caecc8675a424a.png' }
)

$results = @()

foreach ($f in $dbFrames) {
    $filePath = Join-Path $framesDir $f.path
    if (-not (Test-Path $filePath)) {
        Write-Output "File not found: $filePath"
        continue
    }
    
    $bmp = New-Object System.Drawing.Bitmap($filePath)
    $w = $bmp.Width
    $h = $bmp.Height
    
    $grid = @()
    $step = 4
    for ($y = 0; $y -lt $h; $y += $step) {
        for ($x = 0; $x -lt $w; $x += $step) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.A -lt 50) {
                $grid += @{X=$x; Y=$y}
            }
        }
    }
    
    $visited = New-Object 'System.Collections.Generic.HashSet[string]'
    $holes = @()
    
    foreach ($pt in $grid) {
        $key = "$($pt.X),$($pt.Y)"
        if ($visited.Contains($key)) { continue }
        
        $minX = $pt.X; $maxX = $pt.X; $minY = $pt.Y; $maxY = $pt.Y
        $queue = New-Object System.Collections.ArrayList
        [void]$queue.Add($pt)
        $visited.Add($key)
        
        $qHead = 0
        while ($qHead -lt $queue.Count) {
            $curr = $queue[$qHead++]
            
            $neighbors = @(
                @{X=$curr.X+$step; Y=$curr.Y}
                @{X=$curr.X-$step; Y=$curr.Y}
                @{X=$curr.X; Y=$curr.Y+$step}
                @{X=$curr.X; Y=$curr.Y-$step}
            )
            
            foreach ($n in $neighbors) {
                if ($n.X -ge 0 -and $n.X -lt $w -and $n.Y -ge 0 -and $n.Y -lt $h) {
                    $nKey = "$($n.X),$($n.Y)"
                    if (-not $visited.Contains($nKey)) {
                        $pPixel = $bmp.GetPixel($n.X, $n.Y)
                        if ($pPixel.A -lt 50) {
                            $visited.Add($nKey)
                            [void]$queue.Add($n)
                            if ($n.X -lt $minX) { $minX = $n.X }
                            if ($n.X -gt $maxX) { $maxX = $n.X }
                            if ($n.Y -lt $minY) { $minY = $n.Y }
                            if ($n.Y -gt $maxY) { $maxY = $n.Y }
                        }
                    }
                }
            }
        }
        
        $holeW = $maxX - $minX + 1
        $holeH = $maxY - $minY + 1
        if ($holeW -gt 15 -and $holeH -gt 15) {
            $holes += @{
                x = $minX
                y = $minY
                width = $holeW
                height = $holeH
            }
        }
    }
    
    $bmp.Dispose()
    
    $sortedHoles = $holes | Sort-Object @{ Expression = { $_.y }; Ascending = $true }, @{ Expression = { $_.x }; Ascending = $true }
    
    $slots = @()
    $idx = 0
    foreach ($sh in $sortedHoles) {
        $slots += @{
            slot_index = $idx++
            x = $sh.x
            y = $sh.y
            width = $sh.width
            height = $sh.height
        }
    }
    
    $results += @{
        frame_id = $f.id
        original_width = $w
        original_height = $h
        slots = $slots
    }
    
    Write-Output "Scanned $($f.id): Found $($slots.Count) slots"
}

$results | ConvertTo-Json -Depth 4 | Out-File -FilePath $outputJson -Encoding utf8
Write-Output "Results written to $outputJson"
