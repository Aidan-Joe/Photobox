export function detectHoles(img, width, height) {

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(img,0,0,width,height);

    const imageData = ctx.getImageData(0,0,width,height);

    const data = imageData.data;

    const visited = new Uint8Array(width * height);

    const holes = [];

    for(let y=0;y<height;y++){

        for(let x=0;x<width;x++){

            const index=(y*width+x)*4;

            const alpha=data[index+3];

            const visitedIndex=y*width+x;

            if(alpha<50 && !visited[visitedIndex]){

                let minX=x;
                let maxX=x;
                let minY=y;
                let maxY=y;

                const queue=[[x,y]];

                visited[visitedIndex]=1;

                let head=0;

                while(head<queue.length){

                    const [cx,cy]=queue[head++];

                    [
                        [cx+1,cy],
                        [cx-1,cy],
                        [cx,cy+1],
                        [cx,cy-1]
                    ].forEach(([nx,ny])=>{

                        if(nx<0||ny<0||nx>=width||ny>=height) return;

                        const nextIndex=ny*width+nx;

                        if(visited[nextIndex]) return;

                        const pixel=(nextIndex*4)+3;

                        if(data[pixel]<50){

                            visited[nextIndex]=1;

                            queue.push([nx,ny]);

                            minX=Math.min(minX,nx);
                            maxX=Math.max(maxX,nx);
                            minY=Math.min(minY,ny);
                            maxY=Math.max(maxY,ny);

                        }

                    });

                }

                const w=maxX-minX+1;

                const h=maxY-minY+1;

                if(w>15 && h>15){

                    holes.push({
                        left:minX,
                        top:minY,
                        width:w,
                        height:h
                    });

                }

            }

        }

    }

    holes.sort((a,b)=>{

        if(Math.abs(a.top-b.top)<10){

            return a.left-b.left;

        }

        return a.top-b.top;

    });

    return holes;

}