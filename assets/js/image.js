let image = new Image();
let imageWidth = 0;
let imageHeight = 0;
let imageX = 0;
let imageY = 20;

$('.image-select').addEventListener('change', function(){
    image.src = URL.createObjectURL(this.files[0]);
});

image.addEventListener('load', function() {
    closePopup('image-select');

    imageWidth = image.width;
    imageHeight = image.height;

    boxes[generateBoxID()] = {
        startX: 0, 
        startY: 0, 
        width: imageWidth, 
        height: imageHeight, 
        type: 'body', 
        children: []
    };

    draw();

    window.addEventListener('wheel', (e) => {
        let scrollY = imageY - e.deltaY;
        let scrollTopMin = 20;
        let scrollBottomMin = ((imageHeight - pageHeight)+20)*-1;

        imageY = Math.min(Math.max(scrollY, scrollBottomMin), scrollTopMin);
    });

    window.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        relativeCursorX = (cursorX - imageX);
        relativeCursorY = (cursorY - imageY);
    });
}, false);

$('.set-width').addEventListener('click', () => {
    $('.image-width').value = imageWidth;
});

$('.edit-image-width').addEventListener('click', () => {
    let newWidth = parseInt($('.image-width').value);
    let widthMultiplier = newWidth/imageWidth;

    imageWidth = newWidth;
    imageHeight = Math.floor(imageHeight * widthMultiplier);

    let boxIDs = Object.keys(boxes);

    for(let i=0;i<boxIDs.length;i++){
        let currentBox = boxes[boxIDs[i]];
        
        currentBox.startX = Math.floor(currentBox.startX * widthMultiplier);
        currentBox.startY = Math.floor(currentBox.startY * widthMultiplier);
        currentBox.width = Math.floor(currentBox.width * widthMultiplier);
        currentBox.height = Math.floor(currentBox.height * widthMultiplier);

        boxes[boxIDs[i]] = currentBox;
    }

    closePopup('image-width');
});

const checkBounds = (x, y) => {
    if(x < imageX || x > (imageX + imageWidth)){
        return false;
    }

    if(y < imageY || y > (imageY + imageHeight)){
        return false;
    }

    return true;
}