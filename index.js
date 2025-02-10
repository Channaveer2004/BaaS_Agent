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
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    onSnapshot,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    deleteDoc,

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
// const fetchPostsButtonEl = document.getElementById("fetch-posts-btn")
const postsEl = document.getElementById("posts")
const allFilterButtonEl = document.getElementById("all-filter-btn")
const filterButtonEls = document.getElementsByClassName("filter-btn")


signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)
signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)
signOutButtonEl.addEventListener("click", authSignOut)
updateProfileButtonEl.addEventListener("click", authUpdateProfile)
postButtonEl.addEventListener("click", postButtonPressed)
// fetchPostsButtonEl.addEventListener("click", fetchOnceAndRenderPostsFromDB)


onAuthStateChanged(auth, (user) => {
    if (user) {
        showLoggedInView();
        showProfilePicture(userProfilePictureEl, user)
        showUserGreeting(userGreetingEl, user)
        // fetchInRealtimeAndRenderPostsFromDB(user)
        updateFilterButtonStyle(allFilterButtonEl)
        fetchAllPosts(user)

    } else {
        showLoggedOutView();
    }
});


function authSignInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            alert("Sign in with Google")
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
    alert("Sign up with email and password")

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

async function updatePostInDB(docId, newBody) {
    const postRef = doc(db, "posts", docId)
    await updateDoc(postRef, {
        body: newBody
    })
}

async function deletePostFromDB(docId) {
    await deleteDoc(doc(db, "posts", docId))
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


// async function fetchOnceAndRenderPostsFromDB() {
//     const querySnapshot = await getDocs(collection(db, "posts"))
//     postsEl.innerHTML = "";
//     querySnapshot.forEach((doc) => {
//         renderPost(postsEl, doc.data())
//     })
// }

function fetchInRealtimeAndRenderPostsFromDB(query, user) {
    // const postsRef = collection(db, "posts")
    // const q = query(postsRef, where("uid", "==", user.uid),orderBy("createdAt", "desc"))

    onSnapshot(query, (querySnapshot) => {
        postsEl.innerHTML = "";
        querySnapshot.forEach((doc) => {
            renderPost(postsEl, doc)

        })
    })
}

function fetchTodayPosts(user) {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    const postsRef = collection(db, "posts")
    const q = query(postsRef, where("uid", "==", user.uid),
        where("createdAt", ">=", startOfDay),
        where("createdAt", "<=", endOfDay),
        orderBy("createdAt", "desc"))

    fetchInRealtimeAndRenderPostsFromDB(q, user)
}


function fetchWeekPosts(user) {
    const startOfWeek = new Date()
    startOfWeek.setHours(0, 0, 0, 0)

    if (startOfWeek.getDay() === 0) { // If today is Sunday
        startOfWeek.setDate(startOfWeek.getDate() - 6) // Go to previous Monday
    } else {
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
    }

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    const postsRef = collection(db, "posts")
    const q = query(postsRef, where("uid", "==", user.uid),
        where("createdAt", ">=", startOfWeek),
        where("createdAt", "<=", endOfDay),
        orderBy("createdAt", "desc"))

    fetchInRealtimeAndRenderPostsFromDB(q, user)
}

function fetchMonthPosts(user) {
    const startOfMonth = new Date()
    startOfMonth.setHours(0, 0, 0, 0)
    startOfMonth.setDate(1)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    const postsRef = collection(db, "posts")
    const q = query(postsRef, where("uid", "==", user.uid),
        where("createdAt", ">=", startOfMonth),
        where("createdAt", "<=", endOfDay),
        orderBy("createdAt", "desc"))

    fetchInRealtimeAndRenderPostsFromDB(q, user)
}

function fetchAllPosts(user) {
    const postsRef = collection(db, "posts")
    const q = query(postsRef, where("uid", "==", user.uid),
        orderBy("createdAt", "desc"))

    fetchInRealtimeAndRenderPostsFromDB(q, user)
}

function fetchPostsFromPeriod(period, user) {
    if (period === "today") {
        fetchTodayPosts(user)
    } else if (period === "week") {
        fetchWeekPosts(user)
    } else if (period === "month") {
        fetchMonthPosts(user)
    } else {
        fetchAllPosts(user)
    }
}

function createPostHeader(postData) {
    /*
        <div class="header">
        </div>
    */
    const headerDiv = document.createElement("div")
    headerDiv.className = "header"

    /* 
        <h3>21 Sep 2023 - 14:35</h3>
    */
    const headerDate = document.createElement("h3")
    headerDate.textContent = displayDate(postData.createdAt)
    headerDiv.appendChild(headerDate)

    /* 
        <img src="assets/emojis/5.png">
    */
    const moodImage = document.createElement("img")
    moodImage.src = `public/emojis/${postData.mood}.png`
    headerDiv.appendChild(moodImage)

    return headerDiv
}

function createPostBody(postData) {
    /*
        <p>This is a post</p>
    */
    const postBody = document.createElement("p")
    postBody.innerHTML = replaceNewlinesWithBrTags(postData.body)

    return postBody
}

function createPostUpdateButton(wholeDoc) {
    const postId = wholeDoc.id
    const postData = wholeDoc.data()

    /* 
        <button class="edit-color">Edit</button>
    */
    const button = document.createElement("button")
    button.textContent = "Edit"
    button.classList.add("edit-color")
    button.addEventListener("click", function () {
        const newBody = prompt("Edit the post", postData.body)

        if (newBody) {
            // console.log(newBody)
            updatePostInDB(postId, newBody)
        }
    })

    return button
}

function createPostDeleteButton(wholeDoc) {
    const postId = wholeDoc.id

    /* 
        <button class="delete-color">Delete</button>
    */
    const button = document.createElement('button')
    button.textContent = 'Delete'
    button.classList.add("delete-color")
    button.addEventListener('click', function () {
        // console.log("Delete post")
        deletePostFromDB(postId)
    })
    return button
}

function createPostFooter(wholeDoc) {
    /* 
        <div class="footer">
            <button>Edit</button>
        </div>
    */
    const footerDiv = document.createElement("div")
    footerDiv.className = "footer"
    footerDiv.appendChild(createPostUpdateButton(wholeDoc))
    footerDiv.appendChild(createPostDeleteButton(wholeDoc))
    return footerDiv
}

function renderPost(postsEl, wholeDoc) {
    const postData = wholeDoc.data()
    const postDiv = document.createElement("div")
    postDiv.className = "post"
    postDiv.appendChild(createPostHeader(postData))
    postDiv.appendChild(createPostBody(postData))
    postDiv.appendChild(createPostFooter(wholeDoc))
    postsEl.appendChild(postDiv)

}

function replaceNewlinesWithBrTags(inputString) {
    return inputString.replace(/\n/g, "<br>")
}

function postButtonPressed() {
    const postBody = textareaEl.value
    const user = auth.currentUser

    if (moodState === 0) {
        alert("Please select a mood")
        return;
    }

    if(postBody === ""){
        alert("Please write something")
        return;
    }

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

for (let filterButtonEl of filterButtonEls) {
    filterButtonEl.addEventListener("click", selectFilter)
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
        element.textContent = `Hey ${userFirstName}, how are you..?`
        displayNameInputEl.style.display = "none";
        photoURLInputEl.style.display = "none";
        updateProfileButtonEl.style.display = "none";
    }

    else {
        element.textContent = "Hey friend, how are you?";
    }
}

function displayDate(firebaseDate) {
    if (!firebaseDate) {
        return "Date processing..."
    }
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

function resetAllFilterButtons(allFilterButtons) {
    for (let filterButtonEl of allFilterButtons) {
        filterButtonEl.classList.remove("selected-filter")
    }
}

function updateFilterButtonStyle(element) {
    element.classList.add("selected-filter")
}

function selectFilter(event) {
    const user = auth.currentUser
    const selectedFilterElementId = event.target.id
    const selectedFilterPeriod = selectedFilterElementId.split("-")[0]
    const selectedFilterElement = document.getElementById(selectedFilterElementId)
    resetAllFilterButtons(filterButtonEls)
    updateFilterButtonStyle(selectedFilterElement)
    fetchPostsFromPeriod(selectedFilterPeriod, user)
}
