let currentPage = 1;
const perPage = 10;
let username = 'uraj1';
let apiUrl = `https://api.github.com/users/${username}/repos`;
// console.log(apiUrl)


function showLoader() {
    const target = document.getElementById('loader');
    const spinner = new Spinner().spin();
    target.appendChild(spinner.el);
}

function hideLoader() {
    const target = document.getElementById('loader');
    while (target.firstChild) {
        target.removeChild(target.firstChild);
    }
}
function displayProfile(user) {

    const avatar = document.getElementById('avatar');
    avatar.src = user.avatar_url;
    avatar.alt = `${user.login}'s Avatar`;

    const name = document.getElementById('name');
    name.innerHTML = `${user.name}`

    const profileLink = document.getElementById('profileLink');
    profileLink.innerHTML = `<a href="${user.html_url}" target="_blank" style="color: black; text-decoration: none;"> <strong>GitHub Profile </strong>: ${user.html_url}</a>`;

    const bio = document.getElementById('bio');
    bio.innerHTML = `<strong>Bio:</strong> ${user.bio || 'No bio available'}`;

    const location = document.getElementById('location');
    location.innerHTML = `<strong>Location:</strong> ${user.location || 'Not specified'}`;

}

function truncateDescription(description, wordCount) {
  // Split the description into an array of words
  const words = description.split(' ');

  // Ensure the word count does not exceed the length of the array
  const truncatedWords = words.slice(0, wordCount);

  // Join the truncated words back into a string
  const truncatedDescription = truncatedWords.join(' ');

  // Add ellipsis if the original description has more words than the specified count
  return words.length > wordCount ? truncatedDescription + '...' : truncatedDescription;
}

function displayRepositories(repositories) {
  const repositoriesDiv = document.getElementById('repositories');
  repositoriesDiv.innerHTML = '';

  repositories.forEach(repo => {
      // Creating a new div element for each repository
      const repoDiv = document.createElement('div');
      repoDiv.className = 'repository';

      // Specify the desired word count for the description
      const wordCount = 20;

      // Truncate the description to the specified word count
      const truncatedDescription = truncateDescription(repo.description || 'No description available', wordCount);

      // Populating the innerHTML of the div with information about the repository
      repoDiv.innerHTML = `
        <h2><a href="${repo.html_url}" target="_blank" style="color: #55003b; text-decoration: none; font-weight: 600">${repo.name}</a></h2>
        <p style="font-size: 15px">${truncatedDescription}</p>
        <p><strong>Topics:</strong> ${repo.topics.join(', ') || 'No topics available'}</p>
      `;

      // Appending the created div to the container with id 'repositoriesDiv'
      repositoriesDiv.appendChild(repoDiv);
  });
}

let originalRepositoriesData = [];

// Function to filter repositories based on search input
function searchRepositories() {
    const searchInput = document.getElementById('repoSearch').value.toLowerCase();
    const filteredRepositories = originalRepositoriesData.filter(repo =>
        repo.name.toLowerCase().includes(searchInput) ||
        (repo.description && repo.description.toLowerCase().includes(searchInput)) ||
        repo.topics.join(', ').toLowerCase().includes(searchInput)
    );
    displayRepositories(filteredRepositories);
}

function getRepositories(direction) {
    showLoader();
  
    if (direction === 'prev' && currentPage > 1) {
      currentPage--;
    } else if (direction === 'next') {
      currentPage++;
    }
  
    const url = `${apiUrl}?page=${currentPage}&per_page=${perPage}`;
  
    fetch(url)
      .then(response => response.json())
      .then(repositories => {
        hideLoader();
        originalRepositoriesData = repositories;
        displayRepositories(repositories);
      })
      .catch(error => {
        hideLoader();
        console.error('Error fetching repositories:', error);
      });
  }
  
  function changeUsername() {
    const newUsername = document.getElementById('newUsername').value.trim();
    if (newUsername !== '') {
        username = newUsername;
        apiUrl = `https://api.github.com/users/${username}/repos`;
        getRepositories();
        fetch(`https://api.github.com/users/${username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(user => displayProfile(user))
            .catch(error => {
                console.error('Error fetching user profile:', error);
                alert('Error fetching user profile. Please check if the username is valid.');
            });
    } else {
        alert('Please enter a GitHub username.');
    }
}


fetch(`https://api.github.com/users/${username}`)
    .then(response => response.json())
    .then(user => displayProfile(user))
    .then(() => getRepositories());