var tokenKey = "accessToken";
$(document).ready(ready);

async function loadBooks(token, title="", author="", year1=0, year2=2025) {
    let role;
    var params = {};

    if (title) {
        params.search = title;
    }
    if (author) {
        params.author = author;
    }
    if (year1) {
        params.year1 = year1;
    }
    if (year2) {
        params.year2 = year2;
    }
    var url = new URL('http://localhost:63991/api/user/getbooks');

    url.search = new URLSearchParams(params).toString();
    if (token) {
        role = await authorized(true, token);
    }
    else {
        await authorized(false);
    }
    let books = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            //"Authorization": "Bearer " + token  // передача токена в заголовке
        }
    });
    if (books.ok === true) {

        let b = await books.json();
        let node = document.getElementById("content");
        node.innerHTML = "";
        let number = 1;
        if (role === "admin") {
            document.getElementById('createBookLink').style.display = "inline";
        }
        else {
            document.getElementById('createBookLink').style.display = "none";
        }
        for (var i = 0; i <= b.books.length; i++) {
            if (b.books[i]?.title) {
                let file = b.books[i]?.file.replace("/", "\/");
                if (role === "admin") {

                    node.innerHTML +=
                                       `
                                <div  class="card" style="width: 18rem; float:left; margin-right:5%; margin-bottom:2%; " onmouseenter="mouseIn(` + b.books[i]?.id + `)" onmouseleave="mouseOut(` + b.books[i]?.id +`)">
                                        <img src="`+ b.books[i]?.img + `" width="100%" height="300"   alt="...">                                    
                                        <div style="postion:absolute; opacity:0.66">

                                        <div id="`+ b.books[i]?.id + `" style="margin-top:-300px; display:none; " ><button  style="width:13%; float: right;" class="btn btn-primary col-sm" data-toggle="modal" data-target="#modalEditForm" onclick="edit(` + b.books[i]?.id + `)"><img height="15" src="/StaticImages/edit.png"></button>
                                            <button style="width:13%; float: right;" class="btn btn-danger col-sm" onclick="deleteBook(`+ b.books[i]?.id + `)"><img height="15" src="/StaticImages/delete.png"></button>
                                        </div>
                                    </div>
                                  <div class="card-body" style="postion:absolute;">
                                    <h5 class="card-title">`+ number + `. `+ b.books[i]?.title + `</h5>
                                    <span class="card-text">`+ b.books[i]?.author + `</span><br/>
                                    <span>Year: `+ b.books[i]?.year + `</span><br/>
                                    <img src="/StaticImages/download.png" width="20" style="float:right; cursor:pointer;" onclick="download(`+ b.books[i]?.id + `, '` + file + `')">

                                    <span >Downloads: `+ b.books[i]?.downloads + `</span>
                                  </div>
                                </div>`;
                    //<div style="padding:5px; border: solid 1px; width: 250px;" >
                    //    <span>`+ number +`</span><br/>
                    //    <span>`+ b.books[i]?.title + `</span>
                    //    <br/><span>`+ b.books[i]?.year + `</span>
                    //    <br/><span>`+ b.books[i]?.downloads + `</span>
                    //    <br/><span>`+ b.books[i]?.author + `</span><br/>
                    //    <br/><img width="100" height="100" src="`+ b.books[i]?.img + `"/><br/>
                    //    <br/><button onclick="download(`+ b.books[i]?.id + `, '` + file + `')">Download</button><br/>
                    //    <br/><button onclick="edit(`+ b.books[i]?.id + `)">Edit</button><br/>
                    //    <br/><button onclick="deleteBook(`+ b.books[i]?.id + `)">Delete</button><br/>

                    //</div>
                    //`;
                    number++;
                }
                else {
                    node.innerHTML +=
                        `
                                <div class="card" style="width: 18rem; float:left; margin-right:5%;  margin-bottom:2%;">
                                  <img src="`+ b.books[i]?.img + `"  width="100%" height="300"  alt="...">
                                  <div class="card-body">
                                    <h5 class="card-title">`+ number + `. ` + b.books[i]?.title + `</h5>
                                    <span>`+ b.books[i]?.author + `</span><br/>
                                    <span>Year: `+ b.books[i]?.year + `</span><br/>
                                    <img src="/StaticImages/download.png" width="20" style="float:right; cursor:pointer;" onclick="download(`+ b.books[i]?.id + `, '` + file + `')">
                                  </div>
                                </div>`;
                    number++;
                }

            }

        }
    }
}
function mouseIn(id) {
    document.getElementById(id).style.display = "block";
}
function mouseOut(id) {
    document.getElementById(id).style.display = "none";
}
async function deleteBook(id) {
    const token = sessionStorage.getItem(tokenKey);
    var params = { id: id };
    if (confirm("Are you sure?")) {
        const response = await fetch("http://localhost:63991/api/admin/deletebook", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token  // передача токена в заголовке
            }, body: JSON.stringify(params)
        });
        if (response.ok === true) {

            loadBooks(token);
            toastr.info("Book is deleted!");
        }
        else
            toastr.warnin("Something goes wrong...");

    }
    else {
        return;
    }
}
async function authorized(is, token) {
    if (is === true) {
        document.getElementById("passwordLogin").style.display = "none";
        document.getElementById("emailLogin").style.display = "none";
        document.getElementById("submitLogin").style.display = "none";
        document.getElementById("logOut").style.display = "block";
        document.getElementById('openLogin').style.display = "none";
        document.getElementById('openRegister').style.display = "none";
        const response = await fetch("http://localhost:63991/api/account/getrole", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + token  // передача токена в заголовке
            }
        });
        if (response.ok === true) {

            const data = await response.json();
            return data;
        }
        else
            console.log("Status: ", response.status);
    }
    else {
        document.getElementById("passwordLogin").style.display = "block";
        document.getElementById("emailLogin").style.display = "block";
        document.getElementById("submitLogin").style.display = "block";
        document.getElementById("logOut").style.display = "none";
        document.getElementById('openLogin').style.display = "block";
        document.getElementById('openRegister').style.display = "block";
    }
}
async function ready() {
    //$(".download").click(function () {
    //    let id = this.id;
    //    let log = JSON.stringify({ "id": id });
    //    fetch('http://localhost:63991/api/user/download', {
    //        method: 'POST', headers: {
    //            'Accept': 'application/json',
    //            'Content-Type': 'application/json'
    //        }, body: log
    //    });
    //});
    const token = sessionStorage.getItem(tokenKey);
    loadBooks(token);
    
    //if (token !== null) {
    //    await authorized(true, token);
    //}
    //else {
    //    await authorized(false);
    //}
}
function downloadURI(uri) {

    var link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('target', '_blank');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function download(id, url) {

    var uri = new URL('http://localhost:63991/api/user/download')
    const token = sessionStorage.getItem(tokenKey);
    if (!token) {
        var params = { id: id };
        //url.search = new URLSearchParams(params).toString();
        toastr.warning("Login or register to download book!")
        //alert("Login or register!");
    }
    else {
        var params = { id: id };
        //url.search = new URLSearchParams(params).toString();
        fetch(uri, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token 
            }, body: JSON.stringify(params)
        }).then(function (response) {
            downloadURI(url);
            //const token = sessionStorage.getItem(tokenKey);

            loadBooks(token);
        });
    }


    
}
// отпавка запроса к контроллеру AccountController для получения токена
async function getTokenAsync() {

    document.getElementById('errorLogin').innerHTML = "";
    if (!validateEmail(document.getElementById("emailLogin").value)) {
        document.getElementById('errorLogin').innerHTML = "This is bad email!";   
        return;
    }
    var log = JSON.stringify({ "login": document.getElementById("emailLogin").value, "password": document.getElementById("passwordLogin").value });
    //var elem = document.getElementById('modalLoginForm');
    //elem.parentNode.removeChild(elem);
    //$('.modal-backdrop fade show').display = "none"
    //var content = document.querySelector(".modal-backdrop");
    //content.removeAttribute("class");
    //document.body.removeAttribute("class");
    //var elem = document.getElementById('modalLoginForm').style.display = "none";


    fetch('http://localhost:63991/api/account/token', {
        method: 'POST', headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, body: log
    }).then(
        function (result) {
            if (result.ok === true) {
                document.getElementById("passwordLogin").style.display = "none";
                document.getElementById("emailLogin").style.display = "none";
                document.getElementById("submitLogin").style.display = "none";

                return result.json();
            }
            else {
                return result.json();
            }
        }).then(
            function (response) {
                if (response.errorText) {
                    document.getElementById('errorLogin').innerHTML = response.errorText;
                    return null;
                }
                else {
                    //document.getElementById("userName").innerText = response.username;
                    document.getElementById('closeSignIn').click();

                    sessionStorage.setItem(tokenKey, response.access_token);
                    document.getElementById('openLogin').style.display = "none";
                    document.getElementById('openRegister').style.display = "none";
                    return response.access_token;
                }

            }
    ).then(function (b) {
        if (b) {
            loadBooks(b);
        }
    });


};
$('#orangeForm-email').change(function () {
    document.getElementById('signEmailError').style.display = "none";

});
async function register() {


    var log = JSON.stringify({ "login": document.getElementById("orangeForm-email").value, "password": document.getElementById("orangeForm-pass").value, "passwordConfirm": document.getElementById("orangeForm-ConfirmPass").value });
    //var elem = document.getElementById('modalLoginForm');
    //elem.parentNode.removeChild(elem);
    //$('.modal-backdrop fade show').display = "none"
    //var content = document.querySelector(".modal-backdrop");
    //content.removeAttribute("class");
    //var elem = document.getElementById('modalRegisterForm').style.display = "none";

    //document.getElementById('closeRegisterModal').click();

    document.getElementById("signEmailError").innerHTML = "";

    fetch('http://localhost:63991/api/account/register', {
        method: 'POST', headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, body: log
    }).then(
        function (result) {
            if (result.ok === true) {
                document.getElementById("orangeForm-email").value = "";
                document.getElementById("orangeForm-pass").value = "";
                document.getElementById("orangeForm-ConfirmPass").value = "";

                return result.json();
            }
            else {
                return null;
            }
        }).then(
            function (response) {
                if (response === null) {
 
                    document.getElementById("orangeForm-email").value = "";
                    document.getElementById("orangeForm-pass").value = "";
                    document.getElementById("orangeForm-ConfirmPass").value = "";
                    document.getElementById("signEmailError").innerHTML = "There is already user with such name!";
                    document.getElementById("signEmailError").style.display = "block";
                    return null;
                }
                else {
                    //document.getElementById("userName").innerText = response.username;
                    sessionStorage.setItem(tokenKey, response.access_token);
                    document.getElementById('closeRegisterModal').click();
                    document.getElementById('openLogin').style.display = "none";
                    document.getElementById('openRegister').style.display = "none";
                    return response.access_token;
                }

            }
        ).then(function (b) {
            if (b) {
                loadBooks(b);
            }
        });


};
$('#orangeForm-email').change(function () {
    document.getElementById("signEmailError").innerHTML = "";

});
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
async function edit(id) {
    let book;
    let body = { "id": id };
    document.getElementById('errorEditing').innerHTML = "";

    const response = await fetch('http://localhost:63991/api/user/getbook', {
        method: "POST",
        headers: {
            "Accept": "application/json",
            'Content-Type': 'application/json',

        }, body: JSON.stringify(body)
    });
    if (response.ok === true) {

        book = await response.json();
        //document.getElementById('editBook').style.display = "block";
        document.getElementById('id').value = book?.id;
        document.getElementById('editTitle').value = book?.title;
        document.getElementById('editAuthor').value = book?.author;
        document.getElementById('editYear').value = book?.year;
        document.getElementById('imageEdit').value = "";
        document.getElementById('fileEdit').value = "";
       // document.getElementById('editBook').style.display = "block";

    }
    else
        console.log("Status: ", response.status);


}
$('#signUp').
    click(function (e) {
        if (document.getElementById('orangeForm-pass').value !== document.getElementById('orangeForm-ConfirmPass').value) {
            document.getElementById('signError').innerHTML = "Different passwords!";
            document.getElementById('signError').style.display = "block";
            //document.getElementById('signEmailError').style.display = "none";
        }
        else if (!validateEmail(document.getElementById("orangeForm-email").value)) {
            document.getElementById('signEmailError').style.display = "block";
            document.getElementById('signEmailError').innerHTML = "This is bad email!";
        }
        else {
            register();
        }
    });
$('#searchButton').
    click(function (e) {
        const token = sessionStorage.getItem(tokenKey);
        var title = document.getElementById('searchName').value;
        var author = document.getElementById('searchAuthor').value;
        var year1 = document.getElementById('searchYear1').value;
        var year2 = document.getElementById('searchYear2').value;
        loadBooks(token, title, author, year1, year2);
    });
$('#orangeForm-ConfirmPass').
    change(function (e) {
        document.getElementById('signError').style.display = "none";

    });
$('#orangeForm-pass').
    change(function (e) {
        document.getElementById('signError').style.display = "none";

    });
$('#editForm')
    .submit(function (e) {
        e.preventDefault();
        let fileName = document.getElementById('fileEdit').value;
        let imgName = document.getElementById('imageEdit').value;

        const token = sessionStorage.getItem(tokenKey);
        if (document.getElementById('fileEdit').value !== "" && fileName.substr(fileName.length - 4) !== ".pdf") {
            document.getElementById('errorEditing').innerHTML = "Please, choose .PDF File!";
            return;
        }
        if (document.getElementById('imageEdit').value !== "" && imgName.substr(imgName.length - 4) !== ".jpeg"
            && imgName.substr(imgName.length - 4) !== ".jpg"
            && imgName.substr(imgName.length - 4) !== ".png") {
            document.getElementById('errorEditing').innerHTML = "Please, choose image with .JPG, .JPEG or .PNG extension!";
            return;
        }

        $.ajax({
            url: 'http://localhost:63991/api/admin/editbook',
            type: 'POST',
            data: new FormData(this),
            headers: { "Authorization": "Bearer " + token },
            processData: false,
            contentType: false,
            success: async function () {
                //document.getElementById("modalEditForm").style.display = "none";
                //var content = document.querySelector(".modal-backdrop");
                //content.removeAttribute("class");
                document.getElementById('closeEditModal').click();
                document.getElementById('editTitle').value = "";
                document.getElementById('editAuthor').value = "";
                document.getElementById('editYear').value = "";
                document.getElementById('fileEdit').value = "";
                document.getElementById('imageEdit').value = "";
                //document.getElementById('editBook').style.display = "none";
                await loadBooks(token);
                toastr.info("Book is edited!");

                //loadBooks(token);

            },
            error: function (data) {
                document.getElementById('errorEditing').innerHTML = data.responseJSON.message;
                toastr.warning("Something goes wrong!");

                //loadBooks(token);
            }

        });
        //e.preventDefault();


    });
// отправка запроса к контроллеру ValuesController
async function getData(url) {
    const token = sessionStorage.getItem(tokenKey);

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": "Bearer " + token  // передача токена в заголовке
        }
    });
    if (response.ok === true) {

        const data = await response.json();
        console.log(data['books']);
        alert(data);
    }
    else
        console.log("Status: ", response.status);
};

// получаем токен
document.getElementById("submitLogin").addEventListener("click", e => {

    e.preventDefault();
    //document.getElementById('modalLoginForm').style.display = "none";

    getTokenAsync();
});

// условный выход - просто удаляем токен и меняем видимость блоков
document.getElementById("logOut").addEventListener("click", e => {

    e.preventDefault();
   // document.getElementById("userName").innerText = "";
    document.getElementById("passwordLogin").style.display = "block";
    document.getElementById("emailLogin").style.display = "block";
    document.getElementById("submitLogin").style.display = "block";
    document.getElementById('openLogin').style.display = "block";
    document.getElementById('openRegister').style.display = "block";
    document.getElementById("logOut").style.display = "none";
    sessionStorage.removeItem(tokenKey);
    loadBooks();
});


//// кнопка получения имя пользователя  - /api/values/getlogin
//document.getElementById("getDataByLogin").addEventListener("click", e => {

//    e.preventDefault();
//    getData("/api/values/getlogin");
//});

//// кнопка получения роли  - /api/values/getrole
//document.getElementById("getDataByRole").addEventListener("click", e => {

//    e.preventDefault();
//    getData("/api/values/getrole");
//});