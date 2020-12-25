/*
 * Element selection
 */
const $ = (selector, array=false) => {
    let element = document.querySelectorAll(selector);

    return (element.length > 1 || array ? element : element[0]);
}


/*
 * Popups
 */
$('[data-popup]').addEventListener('click', (e) => {
    openPopup(e.target.dataset.popup);
});

$('.app canvas').addEventListener('click', (e) => {
    if(!e.target.parentElement.classList.contains('inactive')){
        return;
    }

    $('.popup:not(.inactive)').classList.add('inactive');
    $('.app.inactive').classList.remove('inactive');
});

const openPopup = (className) => {
    $(`.popup.${className}-popup`).classList.remove('inactive');
    $('.app').classList.add('inactive');
}

const closePopup = (className) => {
    $(`.popup.${className}-popup`).classList.add('inactive');
    $('.app').classList.remove('inactive');
}


/*
 * Generate new box ID
 */
const generateBoxID = () => {
    return Math.floor(Date.now());
}