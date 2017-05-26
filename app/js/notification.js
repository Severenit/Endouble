const $notification = $('.notification');

$notification.on('click', '.notification-close', function () {
    closeNotification();
})

export function openNotification(type, title, text) {
    $notification
        .addClass('open')
        .addClass(type)
        .find('.notification-title')
        .text(title)
        .parent()
        .find('.notification-message')
        .text(text);

    setTimecloseNotification();
}

export function closeNotification() {
    $notification.removeClass('open').removeClass('info success warning danger');
}

function setTimecloseNotification() {
    setTimeout(function () {
        closeNotification();
    }, 10000);
}
