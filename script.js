const input = document.getElementById("username");
const btn = document.getElementById("searchBtn");

const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");

const profile = document.getElementById("profile");
const avatar = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const bio = document.getElementById("bio");
const joined = document.getElementById("joined");
const portfolio = document.getElementById("portfolio");

const reposContainer = document.getElementById("repos");
const repoList = document.getElementById("repoList");

btn.addEventListener("click", fetchUser);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") fetchUser();
});

async function fetchUser() {
  const username = input.value.trim();
  if (!username) return;

  showLoading();

  try {
    const delay = new Promise(resolve => setTimeout(resolve, 3000));

    //  API call
    const fetchUserData = fetch(`https://api.github.com/users/${username}`);

    const [res] = await Promise.all([fetchUserData, delay]);

    if (!res.ok) throw new Error("User not found");

    const data = await res.json();

    displayProfile(data);

    fetchRepos(data.repos_url);

  } catch (err) {
    showError(err.message);
  }
}

async function fetchRepos(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();

    const topRepos = data
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    displayRepos(topRepos);

  } catch {
    console.log("Repo fetch failed");
  }
}

function displayProfile(user) {
  loading.classList.add("hidden");
  errorBox.classList.add("hidden");

  profile.classList.remove("hidden");
  reposContainer.classList.remove("hidden");

  avatar.src = user.avatar_url;
  nameEl.textContent = user.name || user.login;

  if (user.bio) {
    bio.textContent = user.bio;
  } else {
    bio.textContent = "No bio found";
    bio.style.color = "#ef4444"; 
  }

  const date = new Date(user.created_at);
  joined.textContent = `Joined: ${formatDate(date)}`;

  if (user.blog && user.blog.trim() !== "") {
    portfolio.style.display = "inline-block";

    portfolio.onclick = () => {
      window.open(user.blog, "_blank");
    };

  } else {
    portfolio.style.display = "inline-block";

    portfolio.onclick = () => {
      showModal("No portfolio link available");
    };
  }
}

function displayRepos(repos) {
  repoList.innerHTML = "";

  repos.forEach(repo => {
    const li = document.createElement("li");

    li.innerHTML = `
      <a href="${repo.html_url}" target="_blank">
        ${repo.name}
      </a>
    `;

    repoList.appendChild(li);
  });
}

function showLoading() {
  loading.classList.remove("hidden");
  errorBox.classList.add("hidden");
  profile.classList.add("hidden");
  reposContainer.classList.add("hidden");

  btn.disabled = true;
}

function hideLoading() {
  loading.classList.add("hidden");
  btn.disabled = false;
}

function showError(msg) {
  loading.classList.add("hidden");

  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");

  profile.classList.add("hidden");
  reposContainer.classList.add("hidden");
}

function formatDate(date) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function showModal(message) {
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
