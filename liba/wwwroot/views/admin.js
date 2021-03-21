var tokenKey = "accessToken";
$(document).ready(ready);
function createBook() {
    $.ajax({
        url: 'http://localhost:63991/api/admin/createbook',
        data: $('#file').attr('files'),
        cache: false,
        contentType: 'multipart/form-data',
        processData: false,
        type: 'POST',
        success: function (data) {
            alert(data);
        }
    });
}
$('#formId')
    .submit(function (e) {
        const token = sessionStorage.getItem(tokenKey);

        $.ajax({
            url: 'http://localhost:63991/api/admin/createbook',
            type: 'POST',
            data: new FormData(this),
            processData: false,
            headers: { "Authorization": "Bearer " + token },
            contentType: false,
            success: function () {
                document.getElementById('title').value = "";
                document.getElementById('author').value = "";
                document.getElementById('year').value = "";
                document.getElementById('uploadedFile').value = "";
                document.getElementById('img').value = "";
            },
            error: function (message) {
                document.getElementById('errorCreate').innerHTML = message.responseJSON?.message;
            }

        });
        e.preventDefault();

    });
async function authorized(is, token) {
    if (is === true) {
        const response = await fetch("http://localhost:63991/api/account/getrole", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + token  // передача токена в заголовке
            }
        });
        if (response.ok === true) {

            const data = await response.json();
            if (data !== "admin") {
                var node = document.createElement('a');
                node.href = "http://localhost:63991/views/index.html";
                document.body.appendChild(node);
                node.click();
                //document.body.removeChild(node);
            }
            else {
                document.getElementById('createBook').style.display = "block";
            }
        }
        else {
            console.log("Status: ", response.status);
            var node = document.createElement('a');
            node.href = "http://localhost:63991/views/index.html";
            document.body.appendChild(node);
            node.click();
        }
    }
    else {
        var node = document.createElement('a');
        node.href = "http://localhost:63991/views/index.html";
        document.body.appendChild(node);
        node.click();
    }
}
async function ready() {

    const token = sessionStorage.getItem(tokenKey);

    if (token !== null) {
        authorized(true, token);
    }
    else {
        authorized(false);
    }
}