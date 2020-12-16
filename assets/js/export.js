$('.export').addEventListener('click', () => {
    //Can't export if there's nothing to export
    if(Object.keys(boxes).length == 1){
        return;
    }

    //Right, now start the export process
    sortImmediateChildren();
    
    //Now we've done that, we can start to
    //loop through and generate the html
    generateEmail();
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

const sortChildrenByX = (children) => {
    return children.sort(function (a, b) {
        return boxes[a].startX - boxes[b].startX;
    });
}

const mergeObjectToParent = (object) => {
    //This function is only used in the first step
    //to merge two arrays together. I can't use
    //Array.concat() as I need to do a check before

    let keys = Object.keys(object);

    for(let i=0;i<keys.length;i++){
        let currentBoxID = keys[i];
        let currentBox = object[currentBoxID];

        boxes[currentBoxID] = currentBox;

        if(currentBox.type == 'container'){
            boxes[getParentBoxID()].children.push(currentBoxID);
        }
    }
}

const generateEmail = () => {
    //We're gonna do this again
    const parentBox = getParentBox();
    const parentChildren = parentBox.children;
    const sortedChildren = sortChildrenByY(parentChildren);

    let emailElement = createElement('table');

    for(let i=0;i<sortedChildren.length;i++){
        let currentBox = sortedChildren[i];

        let currentBoxHTML = generateHTMLFromBox(currentBox, emailElement);
        emailElement.childNodes[0].appendChild(currentBoxHTML);
    }

    console.log(boxes);
    console.log(emailElement);
}

const generateHTMLFromBox = (id, parentElement) => {
    const box = boxes[id];
    let newCell;

    switch(box.type){
        case 'container':
            //These variables are up here to stop JS
            //shouting at me that they're undefined.
            //They aren't used if the parent isn't a
            //table.
            let newRow;

            if(parentElement.tagName == 'TABLE'){
                //Then this is the parent box, so
                //create some elements for the children
                //to sit in
                newRow = parentElement.insertRow();
                newCell = newRow.insertCell();
            }

            let newTable = createElement('table');

            //Check here whether this container has several
            //rows as children (warning: beef)
            if(box.children.length > 1 
            && boxes[box.children[0]].width == box.width && boxes[box.children[0]].height != box.height){
                //This is a group of trs
                let boxChildren = sortChildrenByY(box.children);

                for(let i=0;i<boxChildren.length;i++){
                    let currentChild = boxChildren[i];

                    let newTableRow = newTable.insertRow();
                    newTableRow.appendChild(generateHTMLFromBox(currentChild, newTableRow));
                }
            }else{
                //This is a group of tds
                let newTableRow = newTable.insertRow();

                let boxChildren = sortChildrenByX(box.children);

                for(let i=0;i<boxChildren.length;i++){
                    let currentChild = boxChildren[i];
    
                    //let newTableCell = newTableRow.insertCell();
                    newTableRow.appendChild(generateHTMLFromBox(currentChild, newTableRow));
                }
            }

            if(parentElement.tagName == 'TABLE'){
                newCell.appendChild(newTable);
            }

            return (parentElement.tagName == 'TABLE' ? newRow : newTable);
        break;
        case 'child':
            newCell = createElement('td');

            if(box.children.length){
                for(let i=0;i<box.children.length;i++){
                    let currentChild = box.children[i];

                    newCell.appendChild(generateHTMLFromBox(currentChild, newCell));
                }
            }else{
                let newLink;

                if(box.url !== undefined){
                    console.log('create a new link ' + id);

                    newLink = createElement('a');
                    newLink.href = box.url;
                    newLink.target = '_blank';
                }

                //This is the last child, so we need to get the content
                let newText = document.createTextNode(`image ${id} - alt (${(box.alt ?? '\'\'')})`);

                if(box.url !== undefined){
                    console.log('add new link ' + id);
                    newLink.appendChild(newText);
                    newCell.appendChild(newLink);
                }else{
                    console.log('no link ' + id);
                    newCell.appendChild(newText);
                }
            }

            return newCell;
        break;
    }
}

const createElement = (tag, { childNodes, innerHTML, textContent, attrs } = {}) => {
    let element = document.createElement(tag);

    if(childNodes) {
        Array.from(childNodes).forEach(element.appendChild);
    }

    if(innerHTML) {
        element.innerHTML = innerHTML;
    }

    if(textContent) {
        element.textContent = textContent;
    }

    if(attrs) {
        Object.keys(attrs).forEach(attr => element.setAttribute(attr, attrs[attr]));
    }

    return element;
}