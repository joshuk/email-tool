$('.export').addEventListener('click', () => {
    //Can't export if there's nothing to export
    if(Object.keys(boxes).length == 1){
        return;
    }

    //Right, now start the export process
    sortImmediateChildren();
});

const sortImmediateChildren = () => {
    //We need to start by sorting out the
    //immediate children of the parent box.

    const parentBox = getParentBox();
    const parentChildren = parentBox.children;
    const sortedChildren = sortChildrenByY(parentChildren);

    //Now all of the children are sorted by
    //the order they appear, we need to find
    //any gaps and fill them.
    let lastYBottom = 0;
    let newBoxes = {};

    for(let i=0;i<sortedChildren.length;i++){
        let currentBoxID = sortedChildren[i];
        let currentBox = boxes[currentBoxID];

        if(lastYBottom < currentBox.startY){
            //So we need to make two filler boxes,
            //since there's a gap there

            //Some absolute demon ID to try and
            //avoid two boxes using the same key
            let newContainerID = generateBoxID()+Math.floor(1000*Math.random());
            let newChildID = generateBoxID()+Math.floor(1000*Math.random());

            //We can assume a lot about these boxes,
            //since we know they will be full width
            newBoxes[newContainerID] = {
                startX: 0,
                startY: lastYBottom,
                width: imageWidth,
                height: currentBox.startY-lastYBottom,
                type: 'container',
                parent: getParentBoxID(),
                children: [newChildID]
            };

            //This box will be the same, as it's just
            //to maintain some sructure
            newBoxes[newChildID] = {
                startX: 0,
                startY: lastYBottom,
                width: imageWidth,
                height: currentBox.startY-lastYBottom,
                type: 'child',
                parent: newContainerID,
                children: []
            };
        }

        lastYBottom = currentBox.startY+currentBox.height;
    }

    //Lastly, one check to make sure that
    //it is filled right to the bottom
    let lastChildID = sortedChildren[sortedChildren.length-1];
    let lastChild = boxes[lastChildID];
    let lastChildBottom = (lastChild.startY+lastChild.height);

    if(lastChildBottom < imageHeight){
        let lastContainerID = generateBoxID()+Math.floor(1000*Math.random());
        let lastChildID = generateBoxID()+Math.floor(1000*Math.random());

        newBoxes[lastContainerID] = {
            startX: 0,
            startY: lastChildBottom,
            width: imageWidth,
            height: imageHeight-lastChildBottom,
            type: 'container',
            parent: getParentBoxID(),
            children: [lastChildID]
        };

        newBoxes[lastChildID] = {
            startX: 0,
            startY: lastChildBottom,
            width: imageWidth,
            height: imageHeight-lastChildBottom,
            type: 'child',
            parent: lastContainerID,
            children: []
        };
    }

    //Now we can combine the newBoxes array
    //with the parent
    mergeObjectToParent(newBoxes);
}

const getParentBoxID = () => {
    return Object.keys(boxes)[0];
}

const getParentBox = () => {
    return boxes[getParentBoxID()];
}

const sortChildrenByY = (children) => {
    return children.sort(function (a, b) {
        return boxes[a].startY - boxes[b].startY;
    });
}

const mergeObjectToParent = (object) => {
    //This function is only used in the first step
    //to merge two arrays together. I can't use
    //Array.concat() as I need to do a check before

    let keys = Object.keys(object);

    for(let j=0;j<keys.length;j++){
        let currentBoxID = keys[j];
        let currentBox = object[currentBoxID];

        boxes[currentBoxID] = currentBox;

        if(currentBox.type == 'container'){
            boxes[getParentBoxID()].children.push(currentBoxID);
        }
    }
}