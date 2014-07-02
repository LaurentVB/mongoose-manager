$(function(){

    // from http://davidwalsh.name/javascript-debounce-function
    function debounce(a,b,c){var d;return function(){var e=this,f=arguments;clearTimeout(d),d=setTimeout(function(){d=null,c||a.apply(e,f)},b),c&&!d&&a.apply(e,f)}}

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
            i = $ol.find('>.form-group').length,
            html = $(templateSelector).text().replace(/{{i}}/gi, i);
        $ol.append(html);
        updateCount($ol);
        return false;
    });

    function updateCount($list){
        $list.parents('.array-field').siblings('label').find('.count').text($list.find('li').length);
    }

    var facetsLoaded = false;
    $(document).on('click', '[href^="#advanced-search"]', function(){
        loadFacets();
        return false;
    });

    if ($('#advanced-search').is('.in')){
        loadFacets();
    }

    function loadFacets(){
        if (!facetsLoaded){
            var url = window.location.toString();
            url = url.split('/');
            url.splice(-1, 0, 'facets');
            url = url.join('/');
            $.get(url).done(function(data){
                facetsLoaded = true;
                $('.facets').html(data);
            });
        }
    }

    $(document).on('change', 'input[type="checkbox"].toggle-select-all', function(){
        $('table.documents')
            .find('tbody input[type="checkbox"][name="ids[]"]')
            .prop('checked', $(this).prop('checked'));
    });

    $(document).on('change', 'input[type="checkbox"]', debounce(disableButtons, 50));

    function disableButtons(){
        var disabled = $('table.documents').find('tbody input[type="checkbox"][name="ids[]"]:checked').length == 0;
        $('.actions-on-selected .btn')
            .prop('disabled', disabled)
            .toggleClass('disabled', disabled);
    }

    disableButtons();

    setTimeout(function(){
        $('.notifications .alert').fadeOut();
    }, 3000);

    $(document).on('click', '.btn-action-edit', function(){
        $('#bulk-edit-modal').modal('show');
        return false;
    });

    var bulkEditLoading = $('#bulk-edit-modal .bulk-edit-form').html();

    $('#bulk-edit-modal')
        .on('show.bs.modal', function(){
            var $this = $(this);
            $this.find('.bulk-edit-form').load($this.data('content'), function(){
                $this.find('.bulk-edit-form [name]')
                    .prop('disabled', true)
                    .parents('.form-group')
                    .prepend('<input type="checkbox" class="toggle-enable-disable">');
            });
        })
        .on('hidden.bs.modal', function(){
            $(this).find('.modal-body').html(bulkEditLoading);
        });

    $(document).on('change', 'input[type="checkbox"].toggle-enable-disable', function(){
        $(this).parents('.form-group')
            .toggleClass('alert-info')
            .find('[name]').prop('disabled', !$(this).prop('checked'));
    });
});