let boxes = {};

let cursorX = 0;
let cursorY = 0;
let relativeCursorX = 0;
let relativeCursorY = 0;

let debug = false;

const draw = () => {
    ctx.clearRect(0, 0, pageWidth, pageHeight);

    imageX = ((pageWidth/2) - (imageWidth/2));
    ctx.drawImage(image, imageX, imageY, imageWidth, imageHeight);

    let boxKeys = Object.keys(boxes);

    for(let i=0;i<boxKeys.length;i++){
        let currentBox = boxes[boxKeys[i]];
        let boxStartX = currentBox.startX + imageX;
        let boxStartY = currentBox.startY + imageY;
        let boxWidth = (currentBox.width !== undefined ? currentBox.width : (cursorX - boxStartX));
        let boxHeight = (currentBox.height !== undefined ? currentBox.height : (cursorY - boxStartY));

        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.strokeRect(boxStartX, boxStartY, boxWidth, boxHeight);

        ctx.textAlign = 'left';
        if(debug){
            ctx.fillText(
                `${boxKeys[i]} start`,
                (currentBox.startX + imageX) + 10, 
                (currentBox.startY + imageY) + 15
            );
    
            ctx.fillText(
                `${boxKeys[i]} end`,
                ((currentBox.startX + imageX) + currentBox.width) - 100, 
                ((currentBox.startY + imageY) + boxHeight) - 10
            );
        }

        if(currentBox.width === undefined){
            ctx.fillText(
                `${(cursorX - boxStartX)}px x ${(cursorY - boxStartY)}px`, 
                (currentBox.startX + imageX) + 7, 
                (currentBox.startY + imageY) + 15
            );
        }
        
        ctx.textAlign = 'right';
        ctx.fillText(
            `${(currentBox.url ? 'U ' : '')}${(currentBox.alt ? 'A' : '')}`,
            (currentBox.startX + imageX + currentBox.width) - 7, 
            (currentBox.startY + imageY) + 15
        );
    }

    requestAnimationFrame(draw);
};