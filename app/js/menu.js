const $body = $('body');
const $menuOverlay = $('.header__overlay');
const $menuBurger = $('.header__burger-menu');

export default function Menu() {
    $menuBurger.on('click', function(){
        if(!$menuOverlay.hasClass('active')) {
            $menuOverlay.fadeIn().toggleClass('active');
            $body.css('overflow', 'hidden');
        } else {
            $menuOverlay.fadeOut(function () {
                $menuOverlay.css('display', '');
            }).removeClass('active');
            $body.css('overflow', '');
        }
        $(this).toggleClass("menu-on");
    });
}