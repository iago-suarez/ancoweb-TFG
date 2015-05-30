$(document).ready(function(){
    $('#show-analysis-checkbox').click(function(){
        if(!$('.drawing-layer').attr('hidden')){
            $('.drawing-layer').attr('hidden', 'hidden');
        } else{
        $('.drawing-layer').attr('hidden', 'hidden');
            $('.drawing-layer').removeAttr('hidden');
        }
    });
});