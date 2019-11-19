$(document).ready(function(){
    loadContact();
})

$('#addContact').on('click', function () {
    $('#addfrModal .alert').empty();
    $('#addfrModal .alert').hide();
})


$('#addfr-btn').on('click', function () {
    addContact();
    
})

/**
 * Hàm thực hiện thêm contact
 */
function addContact() {
    var name = $('#addfr-input').val();
    $('#addfrModal .alert').empty();
    $('#addfrModal .alert').hide();
    
    if (name) {
        $.ajax({
            method: 'GET',
            url: '/addfr/' + name,
            async: false,
            dataType: 'json',
            success: function (data) {
                
                if (data.result === true) {
                    var name = data['newuser'].firstname + ' ' + data['newuser'].lastname;
                    
                    $('#add-before').append('You added ' + name + ' before');
                    $('#add-before').show();
                }
                else if (data.result === false) {
                    $('#not-exist').append('Cannot find this user. Please try again.');
                    
                    $('#not-exist').show()
                }
                else {
                    var name = data['newuser'].firstname + ' ' + data['newuser'].lastname;
                    
                    $('#add-success').append('Added ' + name + ' succesfully');
                    loadContact();
                    loadConversation();
                    $('#add-success').show();
                }
            },
            error: function (err) {
                alert('error');
            }
        })
        $('#addfr-input').val('');
    }
};

/**
 * Hàm thực hiện cập nhật danh sách contact
 */
function loadContact() {
    $('#friend-list ul').empty();
    $.ajax({
        method: 'GET',
        url: '/getfr',
        dataType: 'json',
        
        success: function (data) {
            $.each(data, function (index, item) {
                var name = item['firstname'] + ' ' + item['lastname'];
                var user_id = item['user_id'];
                var profileURL=item.profile_img;
                var li= $('<li class="contact" user_id="'+user_id+'"></li>');
                
                var contact = 
                    '<div class="wrap">'+
                '<span class="contact-status busy"></span>'+
                '<img src="'+profileURL+'" alt="" />'+
                '<div class="meta">'+
                '<p class="name">' + name + '</p>'+
                '</div>'+
                '</div>';
                $(li).append(contact);
                $('#friend-list ul').append(li);
            })
        },
        err:function(){
            
        }
    })
}