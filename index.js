import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword, sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,

}
    from "firebase/auth";

import {
    getFirestore, collection, addDoc,
    serverTimestamp, getDocs
} from "firebase/firestore"


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
const db = getFirestore(app)


const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")
const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")
const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")
const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")
const signOutButtonEl = document.getElementById("sign-out-btn")
const userProfilePictureEl = document.getElementById("user-profile-picture")
const userGreetingEl = document.getElementById("user-greeting")
const displayNameInputEl = document.getElementById("display-name-input")
const photoURLInputEl = document.getElementById("photo-url-input")
const updateProfileButtonEl = document.getElementById("update-profile-btn")
const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-btn")
const moodEmojiEls = document.getElementsByClassName("mood-emoji-btn")
const fetchPostsButtonEl = document.getElementById("fetch-posts-btn")
const postsEl = document.getElementById("posts")


signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)
signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)
signOutButtonEl.addEventListener("click", authSignOut)
updateProfileButtonEl.addEventListener("click", authUpdateProfile)
postButtonEl.addEventListener("click", postButtonPressed)
fetchPostsButtonEl.addEventListener("click", fetchOnceAndRenderPostsFromDB)


onAuthStateChanged(auth, (user) => {
    if (user) {
        showLoggedInView();
        showProfilePicture(userProfilePictureEl, user)
        showUserGreeting(userGreetingEl, user)

    } else {
        showLoggedOutView();
    }
});


function authSignInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Sign in with Google")
            alert("Signed in with Google")

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

async function addPostToDB(postBody, user) {
    try {
        const docRef = await addDoc(collection(db, "posts"), {
            body: postBody,
            uid: user.uid,
            createdAt: serverTimestamp(),
            mood: moodState
        })
        // console.log("Document written with ID: ", docRef.id)
        // console.log(serverTimestamp())
    } catch (error) {
        console.error(error.message)
    }
}

function authUpdateProfile() {
    const newDisplayName = displayNameInputEl.value;
    const newPhotoURL = photoURLInputEl.value;

    updateProfile(auth.currentUser, {
        displayName: newDisplayName, photoURL: newPhotoURL
    }).then(() => {
        alert("Profile updated");
        userGreetingEl.textContent = `Hey ${newDisplayName}, how are you?`;
        userProfilePictureEl.src = newPhotoURL;
        displayNameInputEl.style.display = "none";
        photoURLInputEl.style.display = "none";
        updateProfileButtonEl.style.display = "none";

    }).catch((error) => {
        console.error(error.message);
        alert("Couldn't update profile");
    });
}


async function fetchOnceAndRenderPostsFromDB() {
    
    const querySnapshot = await getDocs(collection(db, "posts"))
    
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data())
    })
}

function postButtonPressed() {
    const postBody = textareaEl.value
    const user = auth.currentUser

    if (postBody && moodState) {
        addPostToDB(postBody, user)
        textareaEl.value = "";
        resetAllMoodElements(moodEmojiEls)
    }
}

for (let moodEmojiEl of moodEmojiEls) {
    moodEmojiEl.addEventListener("click", selectMood)
}

let moodState = 0;

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

function showProfilePicture(imgElement, user) {
    const photoURL = user.photoURL

    if (photoURL) {
        imgElement.src = photoURL
        displayNameInputEl.style.display = "none";
        photoURLInputEl.style.display = "none";
        updateProfileButtonEl.style.display = "none";
    } else {
        imgElement.src = "assets/images/default-user-image.jpeg"
    }
}

function showUserGreeting(element, user) {
    const displayName = user.displayName;
    if (displayName) {
        const userFirstName = displayName.split(" ")[0]
        element.textContent = `Hey ${userFirstName}, how are you?`
        displayNameInputEl.style.display = "none";
        photoURLInputEl.style.display = "none";
        updateProfileButtonEl.style.display = "none";
    }

    else {
        element.textContent = "Hey friend, how are you?";
    }
}

function displayDate(firebaseDate) {
    const date = firebaseDate.toDate()
    
    const day = date.getDate()
    const year = date.getFullYear()
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]

    let hours = date.getHours()
    let minutes = date.getMinutes()
    hours = hours < 10 ? "0" + hours : hours
    minutes = minutes < 10 ? "0" + minutes : minutes

    return `${day} ${month} ${year} - ${hours}:${minutes}`
}

function selectMood(event) {
    const selectedMoodEmojiElementId = event.currentTarget.id
    
    changeMoodsStyleAfterSelection(selectedMoodEmojiElementId, moodEmojiEls)
    
    const chosenMoodValue = returnMoodValueFromElementId(selectedMoodEmojiElementId)
    
    moodState = chosenMoodValue
}

function changeMoodsStyleAfterSelection(selectedMoodElementId, allMoodElements) {
    for (let moodEmojiEl of moodEmojiEls) {
        if (selectedMoodElementId === moodEmojiEl.id) {
            moodEmojiEl.classList.remove("unselected-emoji")          
            moodEmojiEl.classList.add("selected-emoji")
        } else {
            moodEmojiEl.classList.remove("selected-emoji")
            moodEmojiEl.classList.add("unselected-emoji")
        }
    }
}

function resetAllMoodElements(allMoodElements) {
    for (let moodEmojiEl of allMoodElements) {
        moodEmojiEl.classList.remove("selected-emoji")
        moodEmojiEl.classList.remove("unselected-emoji")
    }
    
    moodState = 0
}

function returnMoodValueFromElementId(elementId) {
    return Number(elementId.slice(5))
}