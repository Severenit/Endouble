const $parallax = $('.parallax__header');
const $parallaxBG = $parallax.find('.parallax__bg');

export default function Parallax() {
    $(window).on('scroll', function () {
        var _scrollTop = $(this).scrollTop();
        if (_scrollTop < $parallax.height()) {
            $parallaxBG.css({
                transform: 'translate3d(0px,' + $(window).scrollTop() * 0.2 + 'px,0px) scale(1.2)'
            });
        } else {
            return true;
        }
    });
}

