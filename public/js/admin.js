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
        var $ol = $(this).parents('ol');
        $(this).parents('li').remove();
        updateCount($ol);
        return false;
    });

    $(document).on('click', '[href^="#add-item"]', function(){
        var $ol = $(this).siblings('ol'),
            templateSelector = $ol.data('template'),
            i = $ol.find('.form-group').length,
            html = $(templateSelector).text().replace('{{i}}', i);
        $ol.append(html);
        updateCount($ol);
        return false;
    });

    function updateCount($list){
        $list.parents('.array-field').siblings('label').find('.count').text($list.find('li').length);
    }

    $(document).on('click', '[href^="#advanced-search"]', function(){
        return false;
    });
});