
const FILE_LIMIT = 2 * 1024 * 1024;

var docHeight = $(document).height();

$('.submit').click(function () {
    newMessage();
});

$('#load-message').on('click', function () {
    var messaging = $('#conversation .contact.active').attr('conv_id');


    loadMessage(messaging, pageNumber[messaging]);

    docHeight += 93 * 10;
})

$('.messages ul').on({
    mouseenter: function () {
        var temp = this;
        var message_id = $(this).attr('message_id');

        var list = getUserSeen(message_id);

        $(temp).find('.seen-users').remove();
        $(temp).append('<div class="seen-users"></div>');

        list.forEach(element => {
            if (element != me_id) {
                var friend = getUser(element);
                var profile_url = friend.profile_img;
                var name = friend.firstname + ' ' + friend.lastname;
                
                $(temp).find('.seen-users').append('<img class="seen-img" src="' + profile_url + '" title="'+name+'"/>');
            }
        });
    },

    mouseleave: function () {
        var temp = this;
        $(temp).find('.seen-users').remove();

    }
}, 'li')


$(window).on('keydown', function (e) {
    if (e.which == 13) {

        newMessage();
        return false;
    }
});

/**
 * Hàm thực hiện thêm tin nhắn vào giao diện
 */
function addMessage(type, message, conv_id, message_id, friend_id) {
    var friend = getUser(friend_id);
    var messaging = $('#conversation .contact.active').attr('conv_id');
    var conversation = getConversation(conv_id);
    var sender, imgUrl;
    if (type == 'sent') {
        sender = 'You';
        imgUrl = me.profile_img;
        if (messaging == conv_id) {
            var typing = $('li.typing');
            $('<li class=' + type + ' message_id=' + message_id + '><p>' + message + '</p></li>').appendTo($('.messages ul'));
            $('.messages ul').append(typing);
            $('.message-input input').val(null);
        }
    }
    else {
        sender = friend.lastname;
        imgUrl = friend.profile_img;

        if (messaging != conv_id) {
            if (conversation.name)
                alertify.notify(friend.firstname + " " + friend.lastname + " to " + conversation.name + ": " + message, 'success', 4);
            else
                alertify.notify(friend.firstname + " " + friend.lastname + ": " + message, 'success', 4);
        }
        else {
            var typing = $('li.typing');
            $('<li class=' + type + ' message_id=' + message_id + '><img src="' + imgUrl + '" alt="" class="profile-img"/><p>' + message + '</p></li>').appendTo($('.messages ul'));
            $('.messages ul').append(typing);
            $('.message-input input').val(null);
        }
    }

    var conversation = $('.contact[conv_id=' + conv_id + ']');

    $('#conversation ul').prepend(conversation);
    $(conversation).find('.preview').html('<span>' + sender + ': </span>' + message);

    if (type == 'sent') {
        $(conversation).find('.preview').addClass('marked');
    }
    else {
        $(conversation).find('.preview').removeClass('marked');
    }

    $(conversation).find('.send-time').html('now');
    $(".messages").animate({ scrollTop: docHeight * 2 + 93 }, "fast");
    docHeight += 93;
}
/**
 * Hàm kiểm tra tin nhắn đã được xem
 * @param {message_id} message_id 
 * @param {user_id} user_id 
 */
function isMessageSeen(message_id, user_id) {
    var result
    $.ajax({
        type: "GET",
        url: "/get-status/" + message_id + "/" + user_id,
        async: false,
        contentType: 'application/json',
        success: function (response) {

            result = response;
        }
    });
    return result;
}

/**
 * Hàm thực hiện gửi tin nhắn
 */
function newMessage() {
    message = emoji[0].emojioneArea.getText();
    emoji[0].emojioneArea.setText("");
    var files = $('#file-input').get(0).files;
    //$('#file-input').val(null);
    $('#new-file').hide();

    var user_receive = $('#conversation li.active').data('friends_id');
    var conv_id = $('#conversation li.active').attr('conv_id');

    if (files.length > 0) {
        sendAttachment(files, conv_id, user_receive);
    }
    if ($.trim(message) == '') {
        return false;
    }
    $.ajax({
        type: "POST",
        url: "/sendmessage",
        data: JSON.stringify({ user_send: user_send, user_receive: user_receive, conv_id: conv_id, content: message }),
        dataType: "json",
        contentType: "application/json",
        success: function (response) {

            addMessage('sent', message, conv_id, response);
            socket.emit('new-message', { user_send: user_send, user_receive: user_receive, conv_id: conv_id, content: message, message_id: response });
        }
    });

};

function getUserSeen(message_id) {
    var result;
    $.ajax({
        type: "GET",
        url: "/get-users-seen/" + message_id,
        async: false,
        contentType: 'application/json',
        success: function (response) {

            result = response;

        }
    });
    return result;
}
/**
 * Hàm thực hiện gửi file đính kèm
 * @param  files 
 */


socket.on('new-message', function (message) {

    addMessage('replies', message.content, message.conv_id, message.message_id, message.user_send);

    if ($('#conversation .contact.active').attr('conv_id') == message.conv_id) {
        var friend_id = $('#conversation .contact.active').data('friends_id');
        $.ajax({
            type: "PUT",
            url: "/read-message/" + message.message_id,
            data: JSON.stringify({ user_send: user_send }),
            dataType: "json",
            contentType: "application/json",
            success: function (response) {


            }
        });
    }
})

emoji[0].emojioneArea.on('keyup', function () {

    var user_receive = $('#conversation ul li.active').data('friends_id');
    var conv_id = $('#conversation ul li.active').attr('conv_id');

    socket.emit('typing-on', { user_send: user_send, user_receive: user_receive, conv_id: conv_id });
})



emoji[0].emojioneArea.on('blur', function () {
    var user_receive = $('#conversation ul li.active').data('friends_id');
    var conv_id = $('#conversation ul li.active').attr('conv_id');

    socket.emit('typing-off', { user_send: user_send, user_receive: user_receive, conv_id: conv_id });
})

socket.on('typing-on', (data) => {
    var messaging = $('#conversation .contact.active').attr('conv_id');
    var friend = getUser(data.user_send);

    if (data.conv_id == messaging) {
        if (!$('.messages li:last-child').hasClass('typing')) {
            var typing = '<img id="typing" src="../../Images/typing.gif" ></img>';
            $('<li class="replies typing"><img src="' + friend.profile_img + '"class="profile-img" alt="" /><p>' + typing + '</p></li>').appendTo($('.messages ul'));
            $(".messages").animate({ scrollTop: docHeight + 93 }, "fast");
        }
    }
})

socket.on('typing-off', (data) => {
    var messaging = $('#conversation .contact.active').attr('conv_id');
    if (data.conv_id == messaging) {
        $('li.typing').remove();
    }
})

