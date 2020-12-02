let currentTool = '';

$('.tool', true).forEach((elem) => {
    elem.addEventListener('click', (e) => {
        let target = e.target;

        currentTool = target.dataset.tool;

        if($('.tool.active') !== undefined){
            $('.tool.active').classList.remove('active');
        }
        target.classList.add('active');
    });
});

canvas.addEventListener('click', (e) => {
    if(!checkBounds(e.clientX, e.clientY)){
        return;
    }

    switch(currentTool){
        case 'box':
            boxToolAction();
        break;

        case 'horizontal-split':
            horizontalSplitToolAction();
        break;

        case 'vertical-split':
            verticalSplitToolAction();
        break;

        case 'info':
            infoToolAction();
        break;
    }
});

$('.info-popup .save-info').addEventListener('click', () => {
    let id = $('.info-popup').dataset.id;
    let url = $('.info-popup .info-url').value;
    let altText = $('.info-popup .info-alt-text').value;

    if(url){
        boxes[id].url = url;
    }

    if(altText){
        boxes[id].alt = altText;
    }

    closePopup('info');
});

const findSmallestBox = (x, y, parent = '') => {
    if(!parent){
        parent = Object.keys(boxes)[0];
    }

    children = boxes[parent].children;

    for(let i=0;i<children.length;i++){
        let currentBoxID = children[i];

        //Did you click on this box?
        if(checkBoxBounds(x, y, currentBoxID)){
            let currentBox = boxes[currentBoxID];

            //Is this box complete?
            if(currentBox.width === undefined){
                continue;
            }

            //Does it have children?
            if(currentBox.children.length){
                //Look for the smallest valid box in it's children
                return findSmallestBox(x, y, currentBoxID);
            }else{
                //This is it
                return currentBoxID;
            }
        }
    }

    return parent;
}

const checkBoxBounds = (x, y, id) => {
    let box = boxes[id];

    if(x < box.startX || x > (box.startX + box.width)){
        return false;
    }

    if(y < box.startY || y > (box.startY + box.height)){
        return false
    }

    return true;
}

const boxToolAction = () => {
    let parentBoxID = findSmallestBox(relativeCursorX, relativeCursorY);

    if(!isBoxParent(parentBoxID)){
        //For now, you should only be able to make
        //boxes like this on the parent.
        return;
    }

    //Get last placed box, check if complete
    let boxKeys = Object.keys(boxes);
    let lastBoxID = boxKeys[boxKeys.length - 1];
    let lastBox = boxes[lastBoxID];

    if(lastBox.width !== undefined){
        //Last box is complete, so start a new one

        //Generate new Box ID
        let boxID = generateBoxID();

        let currentBox = {
            startX: relativeCursorX, 
            startY: relativeCursorY, 
            parent: parentBoxID
        };

        boxes[boxID] = currentBox;
    }else{
        //It's not, so use this click to complete the box
        let containerParentID = lastBox.parent;

        if(containerParentID != parentBoxID){
            return;
        }

        let boxStartX = lastBox.startX;
        let boxStartY = lastBox.startY;
        let boxWidth = relativeCursorX - boxStartX;
        let boxHeight = relativeCursorY - boxStartY;

        //If the width or height is negative, flip
        //stuff around so it's positive
        if(boxWidth < 0){
            boxWidth *= -1;
            boxStartX -= boxWidth;                   
        }

        if(boxHeight < 0){
            boxHeight *= -1;
            boxStartY -= boxHeight;
        }

        //Generate IDs
        let containerBoxID = generateBoxID();
        let leftBoxID = (generateBoxID()+1).toString();
        let rightBoxID = (generateBoxID()+2).toString();
        let parentBox = boxes[parentBoxID];

        //Todo - put the container in a container too (idk)

        boxes[containerBoxID] = {
            startX: parentBox.startX, 
            startY: boxStartY, 
            width: parentBox.width,
            height: boxHeight,
            type: 'container',
            children: [
                leftBoxID,
                lastBoxID,
                rightBoxID
            ]
        }

        boxes[leftBoxID] = {
            startX: parentBox.startX, 
            startY: boxStartY, 
            width: boxStartX-parentBox.startX, 
            height: boxHeight,
            type: 'child',
            parent: containerBoxID,
            children: []
        }

        boxes[lastBoxID] = {
            startX: boxStartX, 
            startY: boxStartY, 
            width: boxWidth,
            height: boxHeight, 
            type: 'child',
            parent: containerBoxID,
            children: []
        };

        boxes[rightBoxID] = {
            startX: boxStartX+boxWidth, 
            startY: boxStartY, 
            width: (parentBox.width)-((boxStartX-parentBox.startX)+boxWidth), 
            height: boxHeight,
            type: 'child',
            parent: containerBoxID,
            children: []
        }

        boxes[containerParentID].children.push(containerBoxID);
    }
}

const isBoxParent = (id) => {
    //Whether the box ID is assigned to the
    //first box of the array
    return id == Object.keys(boxes)[0];
}

const findNearestBoxBottom = (y) => {
    let nearestBottomY = 0;
    let nearestDifference = y;

    let firstChildren = Object.values(boxes)[0].children;

    for(let i=0;i<firstChildren.length;i++){
        let currentBoxID = firstChildren[i];
        let currentBox = boxes[currentBoxID];
        let currentBottomY = currentBox.startY + currentBox.height;

        if(currentBottomY < y && (y - currentBottomY) < nearestDifference){
            nearestBottomY = currentBottomY;
            nearestDifference = (y - currentBottomY);
        }
    }

    return nearestBottomY;
}

const horizontalSplitToolAction = () => {
    let parentBoxID = findSmallestBox(relativeCursorX, relativeCursorY);

    if(isBoxParent(parentBoxID)){
        //It's on the main box, so don't split anything.
        //Just create a new box from the last one
        let boxStartY = findNearestBoxBottom(relativeCursorY);

        let containerBoxID = generateBoxID();
        let childBoxID = generateBoxID()+1;

        //We basically create two identical boxes here and
        //just put one inside the other. This is so that if
        //anyone splits this box it will be in a container
        //by default, and we don't have to make one

        boxes[containerBoxID] = {
            startX: 0, 
            startY: boxStartY, 
            width: imageWidth, 
            height: relativeCursorY-boxStartY,
            type: 'container',
            parent: parentBoxID,
            children: [childBoxID]
        };

        boxes[childBoxID] = {
            startX: 0, 
            startY: boxStartY, 
            width: imageWidth, 
            height: relativeCursorY-boxStartY,
            type: 'child',
            parent: containerBoxID,
            children: []
        };

        boxes[parentBoxID].children.push(containerBoxID);
    }else{
        //Clicked on a child, so actually split this one
        let parentBox = boxes[parentBoxID];

        if(parentBox.type == 'container'){
            //This would mean a lot more calculations
            //so I just break instead
            return;
        }

        //Figure out where in the box it should be cut
        let clickDifference = relativeCursorY-parentBox.startY;

        let containerBoxID = generateBoxID();
        let firstChildID = generateBoxID()+1;
        let secondChildID = generateBoxID()+2;

        //Make a container that's the same size as the
        //box that was clicked on
        boxes[containerBoxID] = {
            startX: parentBox.startX,
            startY: parentBox.startY,
            width: parentBox.width,
            height: parentBox.height,
            type: 'container',
            parent: parentBoxID,
            children: [firstChildID, secondChildID]
        }

        //Now make two boxes (since it's been split)
        boxes[firstChildID] = {
            startX: parentBox.startX,
            startY: parentBox.startY,
            width: parentBox.width,
            height: clickDifference,
            type: 'child',
            parent: containerBoxID,
            children: []
        };

        boxes[secondChildID] = {
            startX: parentBox.startX,
            startY: parentBox.startY+clickDifference,
            width: parentBox.width,
            height: parentBox.height-clickDifference,
            type: 'child',
            parent: containerBoxID,
            children: []
        }

        boxes[parentBoxID].children.push(containerBoxID);
    }
}

const verticalSplitToolAction = () => {
    let parentBoxID = findSmallestBox(relativeCursorX, relativeCursorY);

    if(isBoxParent(parentBoxID)){
        //I don't want to have to deal with being
        //able to vertically split the body box,
        //so I'll just return
        return;
    }

    let parentBox = boxes[parentBoxID];
    let newBoxWidth = relativeCursorX-parentBox.startX;

    let splitBoxID = generateBoxID();

    boxes[splitBoxID] = {
        startX: relativeCursorX,
        startY: parentBox.startY,
        width: parentBox.width-newBoxWidth,
        height: parentBox.height,
        type: 'child',
        parent: parentBox.parent,
        children: []
    };

    boxes[parentBoxID].width = newBoxWidth;
    boxes[parentBox.parent].children.push(splitBoxID);
}

const resetInfoPopup = () => {
    $('.info-popup .info-url').value = '';

    $('.info-popup .info-alt-text').value = '';
    $('.info-popup .info-alt-text').style.height = 'auto';
}

const infoToolAction = () => {
    let parentBoxID = findSmallestBox(relativeCursorX, relativeCursorY);
    let parentBox = boxes[parentBoxID];

    if(parentBox.type != 'child'){
        return;
    }

    resetInfoPopup();

    $('.info-popup').dataset.id = parentBoxID;
    $('.info-popup .info-url').value = parentBox.url || '';
    $('.info-popup .info-alt-text').value = parentBox.alt || '';
    openPopup('info');
}