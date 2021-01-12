//Set some variables here that will be needed
//in multiple functions
let exportCanvas, exportCtx;
let imageNumber = 1;
let exportedImages = [];

let fileName = 'email';
let emailSubject = 'Email';

let zipFile = new JSZip();

$('.export').addEventListener('click', () => {
    openPopup('export');
});

$('.begin-export').addEventListener('click', () => {
    closePopup('export');

    //Can't export if there's nothing to export
    if(Object.keys(boxes).length == 1){
        alert('Please add a box to export');
        return;
    }

    if($('.email-filename').value){
        fileName = $('.email-filename').value;
    }
    if($('.email-subject').value){
        emailSubject = $('.email-subject').value;
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

    //Reset the image number
    imageNumber = 1;

    //Let's generate the table first before
    //doing anything else
    let emailElement = createElement('table', {
        attrs: {
            width: imageWidth,
            border: '0',
            cellspacing: '0',
            cellpadding: '0'
        }
    });

    for(let i=0;i<sortedChildren.length;i++){
        let currentBox = sortedChildren[i];

        let currentBoxHTML = generateHTMLFromBox(currentBox, emailElement);
        //Append it to the tbody, not the table
        emailElement.childNodes[0].appendChild(currentBoxHTML);
    }

    //Now that's done, let's generate the
    //body and stuff. All of this is just
    //boring markup shit
    let containerTable = createElement('table', {
        attrs: {
            width: '100%',
            border: '0',
            cellspacing: '0',
            cellpadding: '0'
        }
    });

    let containerRow = containerTable.insertRow();
    let containerCell = containerRow.insertCell();
    containerCell.align = 'center';
    containerCell.appendChild(emailElement);

    let bodyElement = createElement('body', {
        attrs: {
            bgcolor: '#FFFFFF',
            leftmargin: '0',
            topmargin: '0',
            marginwidth: '0',
            marginheight: '0'
        }
    });
    bodyElement.appendChild(containerTable);

    let headElement = createElement('head');
    let titleElement = createElement('title', {
        textContent: emailSubject
    });
    headElement.appendChild(titleElement);

    let htmlElement = createElement('html');
    htmlElement.appendChild(headElement);
    htmlElement.appendChild(bodyElement);

    let emailHTMLString = htmlElement.outerHTML;
    let beautifiedHTMLString = html_beautify(emailHTMLString);

    zipFile.file(`${fileName}.html`, beautifiedHTMLString);
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

                //If there's only one child we'll add the
                //td later on
                if(box.children.length > 1){
                    newCell = newRow.insertCell();
                }
            }

            //We don't need to make a whole new table if
            //there's only one child, just a td
            if(box.children.length == 1){
                if(parentElement.tagName == 'TABLE'){
                    newRow.appendChild(generateHTMLFromBox(box.children[0], newRow));

                    return newRow;
                }else{
                    return generateHTMLFromBox(box.children[0], parentElement);
                }
            }

            let newTable = createElement('table', {
                attrs: {
                    border: '0',
                    cellpadding: '0',
                    cellspacing: '0'
                }
            });

            //Check here whether this container has several
            //rows as children
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

                //Create the link if there is a URL set
                if(box.url !== undefined){
                    newLink = createElement('a', {
                        attrs: {
                            href: box.url,
                            target: '_blank'
                        }
                    });
                }

                let currentImageNumber = imageNumber.toString().padStart(2, '0');

                //This is the last child, so we need to get the content
                let newImage = createElement('img', {
                    attrs: {
                        src: `images/${fileName}_${currentImageNumber}.jpg`,
                        width: box.width,
                        height: Math.floor(box.height),
                        alt: box.alt ?? '',
                        border: '0',
                        style: 'display:block;'
                    }
                });

                getImageFromBox(id, currentImageNumber);

                imageNumber += 1;

                if(box.url !== undefined){
                    newLink.appendChild(newImage);
                    newCell.appendChild(newLink);
                }else{
                    newCell.appendChild(newImage);
                }
            }

            return newCell;
        break;
    }
}

//I took this function from work
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

const getImageFromBox = (id, currentImageNumber) => {
    if(!exportCanvas){
        exportCanvas = createElement('canvas');
        exportCtx = exportCanvas.getContext('2d');
    }

    let box = boxes[id];

    exportCtx.canvas.width = imageWidth;
    exportCtx.canvas.height = imageHeight;

    //If I don't draw the image here and crop
    //it ends up being weird if the image is
    //resized
    exportCtx.drawImage(image, 0, 0, imageWidth, imageHeight);

    //Snip out the part that we actually want
    let boxSnippet = exportCtx.getImageData(box.startX, box.startY, box.width, box.height);

    //Resize the canvas to the size of the
    //current box (which clears it too)
    exportCtx.canvas.width = box.width;
    exportCtx.canvas.height = box.height;

    //Then put it back on the canvas
    exportCtx.putImageData(boxSnippet, 0, 0);

    exportCanvas.toBlob((blob) => {
        zipFile.file(`images/${fileName}_${currentImageNumber}.jpg`, blob);
        exportedImages.push(currentImageNumber);

        if(exportedImages.length == imageNumber-1){
            downloadZip();
        }
    }, 'image/jpeg', 0.95);
}

const downloadZip = () => {
    zipFile.generateAsync({type:'blob'}).then((blob) => {
        let downloadElement = createElement('a', {
            attrs: {
                href: URL.createObjectURL(blob),
                style: 'display:none;',
                download: `${fileName}.zip`
            }
        });

        $('body').appendChild(downloadElement);
        downloadElement.click();
    }, (e) => {
        alert(`File failed to download.\nError:\n ${e}`);
    });
}