$(function(){
    if (!Modernizr.inputtypes.date){
        $('input[type="date"]')
            .wrap('<div class="input-group date"></div>')
            .after('<a class="btn input-group-addon"><span class="glyphicon glyphicon-calendar"></span></a>')
            .parents('.date')
            .datepicker({
                format: 'yyyy-mm-dd'
            });
    }
    $("select.autocomplete").select2();
    $(document).on('click', '[href^="#remove-item"]', function(){
        $(this).parents('li').remove();
        return false;
    });
    $(document).on('click', '[href^="#add-item"]', function(){
        var $ul = $(this).parents('ul'),
            templateId = $ul.data('template'),
            i = $ul.find('.form-group').length,
            html = $('#' + templateId).text().replace('{{i}}', i);
        $('#' + $ul.attr('id') + ' .add-item').before(html);
    });
});