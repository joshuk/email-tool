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

const openPopup = (className) => {
    $('.popup.' + className + '-popup').classList.remove('inactive');
    $('.app').classList.add('inactive');
}

const closePopup = (className) => {
    $('.popup.' + className + '-popup').classList.add('inactive');
    $('.app').classList.remove('inactive');
}


/*
 * Generate new box ID
 */
const generateBoxID = () => {
    return Math.floor(Date.now());
    //return btoa(Math.random()*100).substr(0, 10);
}