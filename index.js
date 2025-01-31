import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword, sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
}
    from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBRPzAMwpiBbox107XcW-AGo6Ku6qGezVE",
    authDomain: "baasagent-13336.firebaseapp.com",
    projectId: "baasagent-13336",
    storageBucket: "baasagent-13336.firebasestorage.app",
    messagingSenderId: "495668832792",
    appId: "1:495668832792:web:8e6c93ee57be01622b716d"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()


const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")
const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")
const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")
const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")
const signOutButtonEl = document.getElementById("sign-out-btn")


signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)
signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)
signOutButtonEl.addEventListener("click", authSignOut)


onAuthStateChanged(auth, (user) => {
    if (user) {
        showLoggedInView();
        const uid = user.uid;

    } else {
        showLoggedOutView();
    }
});


function authSignInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Sign in with Google")
            alert("Signed in with Google")

            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            console.log(user, token, credential)
            
        }).catch((error) => {
            console.error(error.message);
            alert("Couldn't sign in with Google");
        });
}

function authSignInWithEmail() {
    console.log("Sign in with email and password")

    const email = emailInputEl.value
    const password = passwordInputEl.value

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            emailInputEl.value = "";
            passwordInputEl.value = "";
            console.log(userCredential)
        })
        .catch((error) => {
            console.error(error.message);
            alert("Coudn't sign in with the provided credentials");
        });
}

function authCreateAccountWithEmail() {
    console.log("Sign up with email and password")

    const email = emailInputEl.value
    const password = passwordInputEl.value
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            emailInputEl.value = "";
            passwordInputEl.value = "";
        })
        .catch((error) => {
            if (password.length < 6) {
                alert("Password should be at least 6 characters long");
                return;
            }
            console.error(error.message);
            alert("Please enter a valid email and password");
            // ..
        });

    // Send email verification
    // sendEmailVerification(auth.currentUser)
    //     .then(() => {
    //         alert("Email verification sent!");
    //         // ...
    //     });
}

function authSignOut() {
    signOut(auth).then(() => {
        emailInputEl.value = "";
        passwordInputEl.value = "";
        /*clearInputField(emailInputEl)    clearInputField(passwordInputEl)  
        this can also be done by defining in seperate function and calling it here
        */

    }).catch((error) => {
        console.error(error.message);
        alert("Couldn't sign out");
    });

}

function showLoggedOutView() {
    hideView(viewLoggedIn)
    showView(viewLoggedOut)
}

function showLoggedInView() {
    hideView(viewLoggedOut)
    showView(viewLoggedIn)
}

function showView(view) {
    view.style.display = "flex"
}

function hideView(view) {
    view.style.display = "none"
}