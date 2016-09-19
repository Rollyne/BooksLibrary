const kinveyBaseUrl = "https://baas.kinvey.com/";
const kinveyAppKey = "kid_rkHV0pCi";
const kinveyAppSecret = "82fd2086fcde408a91cd23867f9d8e77";

function showView(viewName) {
    //Hide all views and show the selected one
    $('main > section').hide();
    $('#' + viewName).show();
}

function showHideMenuLinks() {
    $("#linkHome").show();
    if (sessionStorage.getItem('authToken') == null) {
        //Not a logged in user
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkListBooks").hide();
        $("#linkCreateBook").hide();
        $("#linkLogout").hide();
    }
    else {
        //The user is logged in
        $("#linkLogin").hide();
        $("#linkRegister").hide();
        $("#linkListBooks").show();
        $("#linkCreateBook").show();
        $("#linkLogout").show();
    }
}

//Notification Functions
function showInfo(message) {
    $('#infoBox').text(message);
    $('#infoBox').show();
    setTimeout(function () { $('#infoBox').fadeOut() }, 3000);
}

function showError(errorMsg) {
    $('#errorBox').text("Error: " + errorMsg);
    $('#errorBox').show();
}

//Page Load Functions
$(function () {
    showHideMenuLinks();
    showView('viewHome');
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListBooks").click(listBooks);
    $("#linkCreateBook").click(showCreateBookView);
    $("#linkLogout").click(logout);
    $("#formLogin").submit(function (event) { event.preventDefault(); login(); });
    $("#formRegister").submit(function (event) { event.preventDefault(); register(); });
    $("#formCreateBook").submit(function (event) { event.preventDefault(); createBook(); });
});

$(document).on({
    ajaxStart: function () { $("#loadingBox").show() },
    ajaxStop: function() { $("#loadingBox").hide() }
})

//View Showers
function showHomeView() {
    showView('viewHome');
}

function showLoginView() {
    showView('viewLogin');
}

function showRegisterView() {
    showView('viewRegister');
}

function showCreateBookView() {
    showView('viewCreateBook');
}

//Login Function
function login() {
    const kinveyLoginUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/login";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };
    let userData = {
        username: $('#loginUser').val(),
        password: $('#loginPass').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyLoginUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: loginSuccess,
        error: handleAjaxError
    });
    function loginSuccess(response) {
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        showHideMenuLinks();
        listBooks();
        showInfo('Login Successful.');
        $('#loginUser').val('');
        $('#loginPass').val('');
    }
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if (response.readyState === 0)
        errorMSG = "Cannot connect due to network error.";
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;
    showError(errorMsg);
}

//Register Function
function register() {
    const kinveyRegisterUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    };
    let userData = {
        username: $('#registerUser').val(),
        password: $('#registerPass').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyRegisterUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: registerSuccess,
        error: handleAjaxError
    });
    function registerSuccess(response) {
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        showHideMenuLinks();
        listBooks();
        showInfo('User Registration Successful.');
        $('#registerUser').val('');
        $('#registerPass').val('');
    }
}

//Listing Books Function
function listBooks() {
    $('#books').empty();
    showView('viewBooks');
    const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books";
    const kinveyAuthHeaders = {
        'Authorization' : "Kinvey " + sessionStorage.getItem('authToken'),
    };
    $.ajax({
        method: "GET",
        url: kinveyBooksUrl,
        headers: kinveyAuthHeaders,
        success: loadBooksSuccess,
        error: handleAjaxError
    });
}

function loadBooksSuccess(books) {
    showInfo('Books loaded.');
    if (books.length == 0) {
        $('#books').text('No books in the library.');
    }
    else {
        let booksTable = $('<table>')
            .append($('<tr>').append(
                '<th>Title</th>',
                '<th>Author</th>',
                '<th>Description</th>')
            );
        for(let book of books) {
            booksTable.append($('<tr>').append(
                $('<td>').text(book.title),
                $('<td>').text(book.author),
                $('<td>').text(book.description))
            );
            $('#books').append(booksTable);
        }
    }
}

//Creating Books
function createBook() {
    const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books";
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
    let bookData = {
        title: $('#bookTitle').val(),
        author: $('#bookAuthor').val(),
        description: $('#bookDescription').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyBooksUrl,
        headers: kinveyAuthHeaders,
        data: bookData,
        success: createBookSuccess,
        error: handleAjaxError
    });

    function createBookSuccess(response) {
        listBooks();
        showInfo('Book created')
        $('#bookTitle').val('');
        $('#bookAuthor').val('');
        $('#bookDescription').val('');
    }
}

function logout() {
    sessionStorage.clear();
    showHideMenuLinks();
	$('#loginUser').val('');
    $('#loginPass').val('');
	$('#registerUser').val('');
    $('#registerPass').val('');
    showHomeView();
}