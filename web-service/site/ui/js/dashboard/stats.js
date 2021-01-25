function show_stats() {
    var users = 0,
        reach = 0,
        endorsement = 0,
        posts = 0;

    $.ajax({
        type: "GET",
        url: api_folder + "statistics?collection=" + collection_param + "&user=" + user_query_param + "&relevance=" + relevance_param + "&q=" + keyword_query_param + "&language=" + language_param + "&original=" + original_param + "&unique=" + unique_param + "&type=" + type_param + "&source=" + source_param + "&topicQuery=" + topic_param + "&since=" + since_param + "&until=" + until_param,
        dataType: "json",
        success: function (json) {

            users = nFormatter(json.users);
            reach = nFormatter(json.reach);
            endorsement = nFormatter(json.endorsement);
            posts = nFormatter(json.total);
            var comma_separator_number_step;

            comma_separator_number_step = $.animateNumber.numberStepFactories.append('');
            if (posts.indexOf('M') > -1) {
                comma_separator_number_step = $.animateNumber.numberStepFactories.append('M');
            }
            if (posts.indexOf('K') > -1) {
                comma_separator_number_step = $.animateNumber.numberStepFactories.append('K');
            }
            $('#posts_num').prop('number', parseInt($('#posts_num').html())).animateNumber({
                    number: posts,
                    numberStep: comma_separator_number_step
                },
                1200);

            comma_separator_number_step = $.animateNumber.numberStepFactories.append('');
            if (users.indexOf('M') > -1) {
                comma_separator_number_step = $.animateNumber.numberStepFactories.append('M');
            }
            if (users.indexOf('K') > -1) {
                comma_separator_number_step = $.animateNumber.numberStepFactories.append('K');
            }
            $('#users_num').prop('number', $('#users_num').html()).animateNumber({
                    number: users,
                    numberStep: comma_separator_number_step
                },
                1200);

            comma_separator_number_step = $.animateNumber.numberStepFactories.append('');
            if (endorsement.indexOf('M') > -1) {
                comma_separator_number_step = $.animateNumber.numberStepFactories.append('M');
            }
            if (endorsement.indexOf('K') > -1) {
                comma_separator_number_step = $.animateNumber.numberStepFactories.append('K');
            }
            $('#endo_num').prop('number', $('#endo_num').html()).animateNumber({
                    number: endorsement,
                    numberStep: comma_separator_number_step
                },
                1200);

            comma_separator_number_step = $.animateNumber.numberStepFactories.append('');
            if (reach.indexOf('M') > -1) {
                comma_separator_number_step = $.animateNumber.numberStepFactories.append('M');
            }
            if (reach.indexOf('K') > -1) {
                comma_separator_number_step = $.animateNumber.numberStepFactories.append('K');
            }
            $('#reach_num').prop('number', $('#reach_num').html()).animateNumber({
                    number: reach,
                    numberStep: comma_separator_number_step
                },
                1200);

            $('.load0').hide();
            $('.minitext').animate({opacity: 1}, 400);
        },
        async: true
    });
}
