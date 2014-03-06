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
        var $ol = $(this).siblings('ol'),
            templateId = $ol.data('template'),
            i = $ol.find('.form-group').length,
            html = $('#' + templateId).text().replace('{{i}}', i);
        $ol.append(html);
    });
});