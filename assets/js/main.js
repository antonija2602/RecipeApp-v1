// ==================== search VAR ====================
const searchInput = document.getElementById("search-input")
const searchButton = document.getElementById("search-button")

// ==================== favorite VAR ====================
const favoriteList = document.getElementById("favorite-list")

// ==================== meals VAR ====================
const mealsContent = document.getElementById("meals-content")

// ==================== recipe VAR ====================
const recipeContainer = document.getElementById("recipe-container")
const recipeContent = document.getElementById("recipe-content")

// ==================== APP START ====================
getRandomMeal()
fetchFavMeals()

// ==================== getRandomMeal() ====================
async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    const respData = await resp.json()
    const randomMeal = respData.meals[0]

    addMeal(randomMeal, true)
    console.log(randomMeal)
}

// ==================== getMealById(id) ====================
async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id)

    const respData = await resp.json()
    const meal = respData.meals[0]

    return meal
}

// ==================== getMealsBySearch(term) ====================
async function getMealsBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term)

    const respData = await resp.json()
    const meals = respData.meals

    return meals
}

// ==================== addMeal(mealData, random = false) ====================
function addMeal(mealData, random = false) {
    const mealDiv = document.createElement("div")
    mealsContent.classList.add("meal")

    mealDiv.innerHTML = `
    
    <div class="meal-header">
    ${
        random
            ? `
        <span class="random"> Random Recipe </span>`
            : ""
    }
    
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="imgtest" />
    <button class="refresh">Refresh</button>

    </div>
    
    <div class="meal-body">
    <h4>${mealData.strMeal}</h4>
    <button class="fav-btn">
    <i class="fas fa-heart"></i>
    </button>
    
    
    </div>`

    const btn = mealDiv.querySelector(".meal-body .fav-btn")

    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeMealLocalStorage(mealData.idMeal)
            btn.classList.remove("active")
        } else {
            addMealLocalStorage(mealData.idMeal)
            btn.classList.add("active")
        }

        fetchFavMeals()
    })
    mealsContent.append(mealDiv)

    const mealImg = mealDiv.querySelector(".meal-header img")
    mealImg.addEventListener("click", () => {
        updateRecipeContent(mealData)
    })

    const refreshButton = mealDiv.querySelector(".refresh")
    refreshButton.addEventListener("click", () => {
        mealsContent.innerHTML = ""
        getRandomMeal()
    })
}

// ==================== addMealLocalStorage(mealId) ====================
function addMealLocalStorage(mealId) {
    const mealIds = getMealsLocalStorage()

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]))
}

// ==================== removeMealLocalStorage(mealId) ====================
function removeMealLocalStorage(mealId) {
    const mealIds = getMealsLocalStorage()

    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId)))
}

// ==================== getMealsLocalStorage() ====================
function getMealsLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"))

    return mealIds === null ? [] : mealIds
}

// ==================== fetchFavMeals() ====================
async function fetchFavMeals() {
    //clean the container
    favoriteList.innerHTML = ""

    const mealIds = getMealsLocalStorage()

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i]

        meal = await getMealById(mealId)
        addMealFav(meal)
    }
}

// ==================== addMealFav(mealData) ====================
function addMealFav(mealData) {
    const favMeal = document.createElement("li")

    favMeal.innerHTML = `      
    <img
    src="${mealData.strMealThumb}" 
    alt="${mealData.strMeal}" />
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fa-solid fa-xmark"></i></button>
    `
    const btnClr = favMeal.querySelector(".clear")

    btnClr.addEventListener("click", () => {
        const btnClrFav = document.querySelector(".meal-body .fav-btn")
        removeMealLocalStorage(mealData.idMeal)
        btnClrFav.classList.remove("active")

        fetchFavMeals()
    })

    const favImg = favMeal.querySelector("li img")
    favImg.addEventListener("click", () => {
        updateRecipeContent(mealData)
    })
    favoriteList.append(favMeal)
}

// ==================== updateRecipeContent(mealData) ====================
function updateRecipeContent(mealData) {
    // clean the recipe__content
    recipeContent.innerHTML = ""

    // update the Recipe
    const recipeDiv = document.createElement("div")
    recipeContent.append(recipeDiv)

    // move class .hidden and show recipe__content
    recipeContainer.classList.remove("hidden")

    //get ingredients and measures
    const ingredients = []
    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(`${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]} `)
        } else {
            break
        }
    }
    recipeContent.innerHTML = `
    <button><i class="fa-solid fa-xmark"></i></button>
        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}" />
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        
        </ul>
        <a href="${mealData.strSource}" target="_blank">${mealData.strSource}</a>
        
        <a href="${mealData.strYoutube}" target="_blank"><i class="fa-brands fa-youtube">youtube</i></a>
        
        `

    const recipeButton = document.querySelector("#recipe-content button")

    recipeButton.addEventListener("click", () => {
        recipeContainer.classList.add("hidden")
    })
}

// ==================== addEventListener ====================
searchButton.addEventListener("click", async () => {
    //clean container
    mealsContent.innerHTML = ""

    const search = searchInput.value
    const meals = await getMealsBySearch(search)

    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal)
        })
    }
})
