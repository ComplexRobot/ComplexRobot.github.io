document.addEventListener("DOMContentLoaded", (event) => {
  const powerNameFixes = { "Exp-Point" : "Exp. Point", "Item-Drop" : "Item Drop" };
  for (const power of document.getElementsByClassName("powerselection")) {
    let name;
    if (power.id in powerNameFixes)
      name = `${powerNameFixes[power.id]} Power`;
    else
      name = `${power.id} Power`;
    if (name in sprites) {
      power.parentElement.style.backgroundImage = `url('${sprites[name]}')`;
      power.innerHTML = name;
    }
    else {
      power.parentElement.style.backgroundImage = power.id;
      power.innerHTML = power.id;
    }
  }
  for (const type of document.getElementsByClassName("typeselection")) {
    if (type.id in sprites)
      type.parentElement.style.backgroundImage = `url('${sprites[type.id]}')`;
    type.innerHTML = type.id;
  }
  for (const herba of document.getElementsByClassName("herbaselection")) {
    const name = `${herba.id} Herba Mystica`;
    herba.parentElement.style.backgroundImage = `url('${sprites[name]}')`;
    herba.innerHTML = herba.id;
    herba.parentElement.title = name;
    herba.parentElement.addEventListener("click", (event) => { ToggleHerba(herba.id); });
  }
  UpdateChoiceDiv("power1");
  UpdateChoiceDiv("power2");
  UpdateChoiceDiv("power3");
  UpdateChoiceDiv("type1");
  UpdateChoiceDiv("type2");
  UpdateChoiceDiv("type3");
  document.getElementById("power1").parentElement.addEventListener("click", (event) => { ShowSelector("power1", "powerselector"); });
  document.getElementById("power2").parentElement.addEventListener("click", (event) => { ShowSelector("power2", "powerselector"); });
  document.getElementById("power3").parentElement.addEventListener("click", (event) => { ShowSelector("power3", "powerselector"); });
  document.getElementById("type1").parentElement.addEventListener("click", (event) => { ShowSelector("type1", "typeselector"); });
  document.getElementById("type2").parentElement.addEventListener("click", (event) => { ShowSelector("type2", "typeselector"); });
  document.getElementById("type3").parentElement.addEventListener("click", (event) => { ShowSelector("type3", "typeselector"); });
  for (const selectionDiv of document.getElementsByClassName("powerselection")) {
    selectionDiv.parentElement.addEventListener("click", (event) => { UpdateSelection(event.target.children[0], "powerselector"); });
    selectionDiv.addEventListener("click", (event) => { UpdateSelection(event.target, "powerselector"); });
  }
  for (const selectionDiv of document.getElementsByClassName("typeselection")) {
    selectionDiv.parentElement.addEventListener("click", (event) => { UpdateSelection(event.target.children[0], "typeselector"); });
    selectionDiv.addEventListener("click", (event) => { UpdateSelection(event.target, "typeselector"); });
  }
  document.getElementsByClassName("recipeslistwrapper")[0].style.setProperty("top",
    document.getElementsByClassName("selector")[0].offsetHeight + "px");
  document.getElementsByClassName("recipeslistwrapper")[0].style.setProperty("height",
    "calc(100% - " + document.getElementsByClassName("selector")[0].offsetHeight + "px)");
  initialHTML = document.getElementsByClassName("recipeslist")[0].innerHTML;
  if (window.location.search && window.location.search.startsWith("?")) {
    const urlSearchParams = new URLSearchParams(window.location.search.slice(1));
    const powerMap = {};
    for (const div of document.getElementsByClassName("powerselection")) {
      powerMap[div.innerHTML.replace(/[^\w].*/, "")] = div.innerHTML;
    }
    const typeMap = {};
    for (const div of document.getElementsByClassName("typeselection")) {
      typeMap[div.innerHTML] = div.innerHTML;
    }
    const valueMap = { p1 : "power1", p2 : "power2", p3 : "power3", t1 : "type1", t2 : "type2", t3 : "type3" };
    for (const key in valueMap) {
      if (urlSearchParams.has(key)) {
        const urlValueMap = (key.charAt(0) == "p" ? powerMap : typeMap);
        const value = urlSearchParams.get(key);
        if (value in urlValueMap)
          document.getElementById(valueMap[key]).innerHTML = urlValueMap[value];
        else
          document.getElementById(valueMap[key]).innerHTML = "Not Set";
      } else {
        document.getElementById(valueMap[key]).innerHTML = "Not Set";
      }
      UpdateChoiceDiv(valueMap[key], true);
    }
    if (urlSearchParams.has("herba")) {
      let allowedHerbas = [];
      if (urlSearchParams.get("herba") != "None")
        allowedHerbas = urlSearchParams.get("herba").split(",");
      for (const div of document.getElementsByClassName("herbaselection")) {
        if (allowedHerbas.indexOf(div.id) == -1) {
          const checkDiv = document.getElementById(div.id + "check");
          checkDiv.style.backgroundImage = "url('sprites/crossmark.png')";
        }
      }
    }
  }
});

var initialHTML;
var validSelections = false;

function UpdateChoiceDiv(id, skipNotSetCheck = false) {
  const div = document.getElementById(id);
  if (div.innerHTML in sprites)
    div.parentElement.style.backgroundImage = `url('${sprites[div.innerHTML]}')`;
  else {
    div.parentElement.style.removeProperty("background-image");
  }
  if (!skipNotSetCheck && div.innerHTML == "Not Set" && id.slice(0, -1) == "power") {
    const otherDiv = document.getElementById("type" + id.slice(-1));
    otherDiv.innerHTML = "Not Set";
    otherDiv.parentElement.style.removeProperty("background-image");
  }
}

var selectedDiv = null;
function ShowSelector(divId, selectorClass) {
  const selectorDiv = document.getElementsByClassName(selectorClass)[0];
  if (selectorDiv.style.getPropertyValue("visibility") == "visible" && divId == selectedDiv) {
    selectorDiv.style.setProperty("visibility", "hidden");
    const div = document.getElementById(selectedDiv);
    div.parentElement.id = "";
    selectedDiv = null;
    return;
  }
  if (selectedDiv != null) {
    const div = document.getElementById(selectedDiv);
    div.parentElement.id = "";
    selectedDiv = null;
  }
  selectorDiv.style.setProperty("visibility", "visible");
  if (selectorClass == "powerselector")
    document.getElementsByClassName("typeselector")[0].style.setProperty("visibility", "hidden");
  else
    document.getElementsByClassName("powerselector")[0].style.setProperty("visibility", "hidden");
  selectedDiv = divId;
  const div = document.getElementById(selectedDiv);
  div.parentElement.id = "selected";
  const rect = div.getBoundingClientRect();
  selectorDiv.style.setProperty("left", document.getElementById(selectedDiv.slice(0, -1) + "1").parentElement.getBoundingClientRect().x + "px");
  selectorDiv.style.setProperty("top", rect.y + rect.height + "px");
  for (const childDiv of selectorDiv.children) {
    if (childDiv.className == "checkmark") {
      SetSelectorCheckmark(childDiv, divId);
      break;
    }
  }
}

function SetSelectorCheckmark(checkDiv, selectId) {
  const value = document.getElementById(selectId).innerHTML;
  for (const childDiv of checkDiv.parentElement.children) {
    if (childDiv.children[0].innerHTML == value) {
      const parentRect = checkDiv.parentElement.getBoundingClientRect();
      const rect = childDiv.getBoundingClientRect();
      checkDiv.style.setProperty("left", rect.x - parentRect.x + "px");
      checkDiv.style.setProperty("top", rect.y -parentRect.y + "px");
      break;
    }
  }
}

function UpdateSelection(target, selectorClass) {
  document.getElementsByClassName(selectorClass)[0].style.setProperty("visibility", "hidden");
  if (selectedDiv != null) {
    const div = document.getElementById(selectedDiv);
    const divId = selectedDiv;
    selectedDiv = null;
    div.parentElement.id = "";
    if (div.innerHTML != target.innerHTML) {
      div.innerHTML = target.innerHTML;
      UpdateChoiceDiv(divId);
      GenerateRecipes();
    }
  }
}

function ToggleHerba(id) {
  const checkDiv = document.getElementById(id + "check");
  if (checkDiv.style.backgroundImage == "")
    checkDiv.style.backgroundImage = "url('sprites/crossmark.png')";
   else
    checkDiv.style.removeProperty("background-image");
  if (selectedDiv != null) {
    const div = document.getElementById(selectedDiv);
    div.parentElement.id = "";
    selectedDiv = null;
    document.getElementsByClassName("typeselector")[0].style.setProperty("visibility", "hidden");
    document.getElementsByClassName("powerselector")[0].style.setProperty("visibility", "hidden");
  }
  GenerateRecipes();
}

function GetAllowedHerbas() {
  const herbaArray = {};
  for (const herbaDiv of document.getElementsByClassName("herbaselection")) {
    const checkDiv = document.getElementById(herbaDiv.id + "check");
    if (checkDiv.style.backgroundImage == "")
      herbaArray[herbaDiv.parentElement.title] = null;
  }
  return herbaArray;
}

function GetRecipesListDiv() {
  return document.getElementsByClassName("recipeslist")[0];
}

var forceGenerate = false;
async function GenerateRecipes(force = false) {
  if (force || validSelections)
    SetLoadingHTML();
  document.getElementById("recipeprefix").innerHTML = "";
  if (force)
    forceGenerate = true;
  ClearInvalid("power1");
  ClearInvalid("power2");
  ClearInvalid("power3");
  ClearInvalid("type1");
  ClearInvalid("type2");
  ClearInvalid("type3");
  let values = [
    { 
      power : document.getElementById("power1").innerHTML,
      type : document.getElementById("type1").innerHTML,
      powerId : "power1",
      typeId : "type1"
    },
    { 
      power : document.getElementById("power2").innerHTML,
      type : document.getElementById("type2").innerHTML,
      powerId : "power2",
      typeId : "type2"
    },
    { 
      power : document.getElementById("power3").innerHTML,
      type : document.getElementById("type3").innerHTML,
      powerId : "power3",
      typeId : "type3"
    }
  ];
  const urlValues = {};
  for (let i = 0; i < values.length; ++i) {
    if (values[i].power != "Not Set") {
      urlValues["p" + (i + 1)] = values[i].power.replace(/[^\w].*/, "");
      if (values[i].type != "Not Set")
        urlValues["t" + (i + 1)] = values[i].type;
    }
  }
  const allowedHerbas = GetAllowedHerbas();
  if (Object.keys(allowedHerbas).length != 0) {
      if (Object.keys(allowedHerbas).length != 5) {
      urlValues["herba"] = [];
      for (const herba in allowedHerbas) {
        urlValues["herba"].push(herba.replace(/[^\w].*/, ""));
      }
    }
  } else {
    urlValues["herba"] = "None";
  }
  window.history.replaceState(null, "", "?" + (new URLSearchParams(urlValues)).toString());
  for (const value of values) {
    if (value.power == "Egg Power") {
      if (value.type != "Not Set")
        SetInvalid(value.typeId, "sprites/prohibited.webp");
    } else if (value.power == "Not Set" && value.type != "Not Set") {
      SetInvalid(value.typeId);
    }
  }
  values = values.filter((value) => { return value.power != "Not Set"; });
  let result = false;
  if (values.length == 0) {
    SetInvalid("power1");
  } else if (values.length == 1) {
    result = await GenerateLength1(values);
  } else if (values.length == 2) {
    result = await GenerateLength2(values);
  } else if (values.length == 3) {
    result = await GenerateLength3(values);
  }
  if (result === -1) {
    SetInitialHTML();
    validSelections = false;
  } else {
    if (!result) {
      SetNoResultHTML();
      validSelections = false;
    } else if (SelectionsInvalid()) {
      SetInvalidHTML();
      validSelections = false;
    } else if (SelectionsInvalid(false)) {
      SetInvalidHTML();
      validSelections = true;
    } else {
      validSelections = true;
    }
  }
  forceGenerate = false;
}

function SetInvalid(id, value = "sprites/warning-sign.webp") {
  const warningDiv = document.getElementById(id + "warning");
  const div = document.getElementById(id);
  const rect = div.parentElement.getBoundingClientRect();
  warningDiv.style.setProperty("left", rect.x + (rect.width - warningDiv.offsetWidth) / 2 + "px");
  warningDiv.style.setProperty("top", rect.y + (rect.height - warningDiv.offsetHeight) / 2 + "px");
  warningDiv.style.setProperty("visibility", "visible");
  warningDiv.style.backgroundImage = `url('${value}')`;
  div.parentElement.title = "Invalid";
}

function ClearInvalid(id) {
  const warningDiv = document.getElementById(id + "warning");
  warningDiv.style.setProperty("visibility", "hidden");
  const div = document.getElementById(id);
  div.parentElement.title = "";
}

function ClearAllInvalid() {
  let notSetCount = 0;
  for (id of [ "power1", "power2", "power3", "type1", "type2", "type3" ]) {
    const warningDiv = document.getElementById(id + "warning");
    if (warningDiv.style.getPropertyValue("visibility") != "hidden") {
      const div = document.getElementById(id);
      if (div.innerHTML != "Not Set") {
        div.innerHTML = "Not Set";
        UpdateChoiceDiv(id, true);
      }
      else
        ++notSetCount;
      ClearInvalid(id);
    }
  }
  GenerateRecipes(notSetCount == 0);
}

function AllInvalidsNotSet() {
  for (id of [ "power1", "power2", "power3", "type1", "type2", "type3" ]) {
    const warningDiv = document.getElementById(id + "warning");
    if (warningDiv.style.getPropertyValue("visibility") != "hidden") {
      const div = document.getElementById(id);
      if (div.innerHTML != "Not Set")
        return false;
    }
  }
  return true;
}

function SelectionsInvalid(includeProhibited = true) {
  for (const div of document.getElementsByClassName("warningsign")) {
    if (div.style.getPropertyValue("visibility") != "hidden"
      && (!includeProhibited || div.style.getPropertyValue("background-image").search("prohibited") == -1))
      return true;
  }
  return false;
}

function SetLoadingHTML() {
  GetRecipesListDiv().innerHTML = "Loading...";
}

function SetNoResultHTML() {
  if (SelectionsInvalid()) {
    GetRecipesListDiv().innerHTML = "No results. <img src='sprites/warning-sign.webp'> Invalid selections.";
  } else {
    GetRecipesListDiv().innerHTML = "No results. Impossible combination! &#128557;";
  }
}

function SetInitialHTML() {
  GetRecipesListDiv().innerHTML = initialHTML;
}

function SetInvalidHTML() {
  const prefixDiv = document.getElementById("recipeprefix");
  prefixDiv.innerHTML = "<img src='sprites/warning-sign.webp'> Some invalid selections were ignored.";
  if (!AllInvalidsNotSet())
    prefixDiv.innerHTML += "<br><a href='javascript:ClearAllInvalid()'>&#128070; <u>Clear All Invalid</u></a>";
}

async function GenerateLength1(values) {
  if (values[0].power == "Sparkling Power") {
    if (values[0].powerId != "power1")
      SetInvalid("power1");
    else
      SetInvalid("power2");
    return false;
  } else if (values[0].power != "Egg Power" && values[0].type == "Not Set") {
    SetInvalid(values[0].typeId);
    return false;
  } else {
    let recipes;
    if (values[0].power == "Egg Power")
      recipes = await GetRecipes("1", "Egg___");
    else
      recipes = await GetRecipes("1", `${values[0].power.slice(0, 3)}${values[0].type.slice(0, 3)}`);
    return LoadRecipes(recipes);
  }
  GetRecipesListDiv().innerHTML = "Error.";
  return true;
}

async function GenerateLength2(values, otherValue = null) {
  if (values[0].power == values[1].power) {
    SetInvalid(values[1].powerId);
    return await GenerateLength1(values.slice(0, 1));
  } else if (values[0].type == "Not Set" && values[1].type == "Not Set") {
    if (values[0].power != "Egg Power")
      SetInvalid(values[0].typeId);
    else
      SetInvalid(values[1].typeId);
    if (values[0].power == "Egg Power")
      return await GenerateLength1(values.slice(0, 1));
    else if (values[1].power == "Egg Power")
      return await GenerateLength1(values.slice(1));
    return false;
  }
  let sorted = [...values].sort((a, b) => { return a.power < b.power ? -1 : 1; });
  if (values[0].power == "Sparkling Power" || values[1].power == "Sparkling Power") {
    if (sorted[0].power == "Sparkling Power" && sorted[1].power == "Title Power") {
      SetInvalid(sorted[1].powerId);
      return false;
    } else {
      const filtered = values.filter((value) => { return value.type != "Not Set"; });
      if (values[1].type != filtered[0].type && values[1].type != "Not Set")
        SetInvalid(values[1].typeId);
      if (otherValue != null && otherValue.type != filtered[0].type && otherValue.type != "Not Set")
        SetInvalid(otherValue.typeId);
      ClearInvalid(filtered[0].typeId);
      let recipes;
      if (values[0].power == "Sparkling Power")
        recipes = await GetRecipes("lv3", values[1].power.slice(0, 3) + filtered[0].type.slice(0, 3));
      else
        recipes = await GetRecipes("lv3", values[0].power.slice(0, 3) + filtered[0].type.slice(0, 3));
      return LoadRecipes(recipes);
    }
  } else {
    if (values[0].power == "Egg Power" || values[1].power == "Egg Power") {
      if (sorted[0].power == "Egg Power") {
        if (sorted[1].type != "Not Set") {
          const recipes = await GetRecipes("2", sorted[0].power.slice(0, 3) + "___"
            + sorted[1].power.slice(0, 3) + sorted[1].type.slice(0, 3));
          return LoadRecipes(recipes);
        } else {
          SetInvalid(sorted[1].typeId);
          return await GenerateLength1(values.slice(0, 1));
        }
      } else {
        if (sorted[0].type != "Not Set") {
          const recipes = await GetRecipes("2", sorted[0].power.slice(0, 3) + sorted[0].type.slice(0, 3)
            + sorted[1].power.slice(0, 3) + "___");
          return LoadRecipes(recipes);
        } else {
          SetInvalid(sorted[0].typeId);
          return await GenerateLength1(values.slice(1));
        }
      }
    } else if (values[0].type == values[1].type) {
      if (values[0].type == "Not Set") {
        SetInvalid(values[0].typeId);
        return false;
      } else if (values[0].power != "Title Power" && values[1].power != "Title Power") {
        SetInvalid(values[1].typeId);
        return await GenerateLength1(values.slice(0, 1));
      } else {
        let recipes = await GetRecipes("2", sorted[0].power.slice(0, 3) + sorted[0].type.slice(0, 3)
            + sorted[1].power.slice(0, 3) + sorted[1].type.slice(0, 3));
        return LoadRecipes(recipes);
      }
    } else {
      if (values[0].type == "Not Set" || values[1].type == "Not Set") {
        if (values[0].type == "Not Set") {
          SetInvalid(values[0].typeId);
          return await GenerateLength1(values.slice(1));
        } else {
          SetInvalid(values[1].typeId);
          return await GenerateLength1(values.slice(0, 1));
        }
      } else {
        let recipes = await GetRecipes("2", sorted[0].power.slice(0, 3) + sorted[0].type.slice(0, 3)
            + sorted[1].power.slice(0, 3) + sorted[1].type.slice(0, 3));
        return LoadRecipes(recipes);
      }
    }
  }
  GetRecipesListDiv().innerHTML = "Error.";
  return true;
}

async function GenerateLength3(values) {
  let result;
  if ((values[0].power == values[1].power && values[0].power == values[2].power)) {
    SetInvalid(values[2].powerId);
    return await GenerateLength2([ values[0], values[1] ], values[2]);
  } else if (values[0].power == values[1].power) {
    validSelections = false;
    if (!(result = await GenerateLength2([ values[0], values[2] ], values[1]))) {
      SetInvalid(values[0].powerId);
      ClearInvalid(values[1].typeId);
      ClearInvalid(values[2].powerId);
      ClearInvalid(values[2].typeId);
      return await GenerateLength2([ values[1], values[2] ], values[0]);
    } else {
      SetInvalid(values[1].powerId);
      return result;
    }
  } else if (values[0].power == values[2].power) {
    validSelections = false;
    if (!(result = await GenerateLength2([ values[0], values[1] ], values[2]))) {
      SetInvalid(values[0].powerId);
      ClearInvalid(values[2].typeId);
      ClearInvalid(values[1].powerId);
      ClearInvalid(values[1].typeId);
      return await GenerateLength2([ values[1], values[2] ], values[0]);
    } else {
      SetInvalid(values[2].powerId);
      return result;
    }
  } else if (values[1].power == values[2].power) {
    validSelections = false;
    if (!(result = await GenerateLength2([ values[0], values[1] ], values[2]))) {
      SetInvalid(values[1].powerId);
      ClearInvalid(values[2].typeId);
      ClearInvalid(values[0].powerId);
      ClearInvalid(values[0].typeId);
      return await GenerateLength2([ values[0], values[2] ], values[1]);
    } else {
      SetInvalid(values[2].powerId);
      return result;
    }
  } else if (values[0].power == "Sparkling Power" || values[1].power == "Sparkling Power" || values[2].power == "Sparkling Power") {
    if (values[0].power == "Title Power" || values[1].power == "Title Power" || values[2].power == "Title Power") {
      const filtered = values.filter((value) => { return value.power != "Title Power"; });
      const filteredByType = filtered.filter((value) => { return value.type != "Not Set"; });
      const titlePower = values.filter((value) => { return value.power == "Title Power"; })[0];
      if (titlePower.type != filteredByType[0].type && titlePower.type != "Not Set")
        SetInvalid(titlePower.typeId);
      return await GenerateLength2(filtered);
    } else {
      const notSparkling = values.filter((value) => { return value.power != "Sparkling Power"; });
      const filtered = values.filter((value) => { return value != notSparkling[1]; });
      const filteredByType = filtered.filter((value) => { return value.type != "Not Set"; });
      SetInvalid(notSparkling[1].powerId);
      if (filteredByType.length == 0) {
        SetInvalid(filtered[0].typeId);
        return false;
      }
      return await GenerateLength2(filtered);
    }
  }
  let sorted = [...values].sort((a, b) => { return a.power < b.power ? -1 : 1; });
  for (value of values.filter((value) => { return value.type == "Not Set" && value.power != "Egg Power"; })) {
    SetInvalid(value.typeId);
  }
  if (values[0].power == "Egg Power" || values[1].power == "Egg Power" || values[2].power == "Egg Power") {
    const filtered = values.filter((value) => { return value.type != "Not Set" || value.power == "Egg Power"; });
    if (filtered.length == 3) {
      const notEggPower = filtered.filter((value) => { return value.power != "Egg Power"; });
      if (notEggPower[0].power != "Title Power" && notEggPower[1].power != "Title Power" && notEggPower[0].type == notEggPower[1].type) {
        SetInvalid(notEggPower[1].typeId);
        return await GenerateLength2(filtered.filter((value) => { return value != notEggPower[1]; }));
      }
      for (value of values) {
        if (value.power == "Egg Power") {
          value.type = "___";
          break;
        }
      }
      const recipes = await GetRecipes("3", sorted[0].power.slice(0, 3) + sorted[0].type.slice(0, 3)
        + sorted[1].power.slice(0, 3) + sorted[1].type.slice(0, 3)
        + sorted[2].power.slice(0, 3) + sorted[2].type.slice(0, 3));
      return LoadRecipes(recipes);
    }
    if (filtered.length == 2) {
      return await GenerateLength2(filtered);
    } else if (filtered.length == 1) {
      return await GenerateLength1(filtered);
    } else {
      return false;
    }
  } else if (values[0].type == "Not Set" || values[1].type == "Not Set" || values[2].type == "Not Set") {
    const filtered = values.filter((value) => { return value.type != "Not Set"; });
    if (filtered.length == 2) {
      return await GenerateLength2(filtered);
    } else if (filtered.length == 1) {
      return await GenerateLength1(filtered);
    } else {
      return false;
    }
  } else if (values[0].type == values[1].type && values[0].type == values[2].type) {
    if (values[0].power == "Title Power" || values[1].power == "Title Power" || values[2].power == "Title Power") {
      const notTitlePower = values.filter((value) => { return value.power != "Title Power"; });
      SetInvalid(notTitlePower[1].typeId);
      return await GenerateLength2(values.filter((value) => { return value != notTitlePower[1]; }));
    } else {
      SetInvalid(values[2].typeId);
      return await GenerateLength2([ values[0], values[1] ]);
    }
  } else if (values[0].power == "Title Power" || values[1].power == "Title Power" || values[2].power == "Title Power") {
    const notTitlePower = values.filter((value) => { return value.power != "Title Power"; });
    if (notTitlePower.length == 2 && notTitlePower[0].type == notTitlePower[1].type) {
      SetInvalid(notTitlePower[1].typeId);
      return await GenerateLength2(values.filter((value) => { return value != notTitlePower[1]; }));
    } else {
      const recipes = await GetRecipes("3", sorted[0].power.slice(0, 3) + sorted[0].type.slice(0, 3)
        + sorted[1].power.slice(0, 3) + sorted[1].type.slice(0, 3)
        + sorted[2].power.slice(0, 3) + sorted[2].type.slice(0, 3));
      return LoadRecipes(recipes);
    }
  } else if (values[0].type == values[1].type || values[0].type == values[2].type || values[1].type == values[2].type) {
    if (values[0].type == values[1].type) {
      SetInvalid(values[1].typeId);
      return await GenerateLength2([ values[0], values[2] ]);
    } else if (values[0].type == values[2].type || values[1].type == values[2].type) {
      SetInvalid(values[2].typeId);
      return await GenerateLength2([ values[0], values[1] ]);
    }
    return false;
  } else {
    const recipes = await GetRecipes("3", sorted[0].power.slice(0, 3) + sorted[0].type.slice(0, 3)
      + sorted[1].power.slice(0, 3) + sorted[1].type.slice(0, 3)
      + sorted[2].power.slice(0, 3) + sorted[2].type.slice(0, 3));
    return LoadRecipes(recipes);
  }
  GetRecipesListDiv().innerHTML = "Error.";
  return true;
}

var cachedRecipe;
var cachedResult;
async function GetRecipes(folder, powers) {
  if (!forceGenerate && (!validSelections || SelectionsInvalid())) {
    if (cachedResult == `${folder}/${powers}`)
      return true;
    return await fetch(`scripts/data/${folder}/${powers}.json`, { method: "HEAD" })
      .then((response) => { return response.ok ? true : null; });
  }
  if (cachedResult == `${folder}/${powers}`)
      return cachedRecipe;
  const recipe = await fetch(`scripts/data/${folder}/${powers}.json`)
    .then((response) => { return response.ok ? response.json() : null; });
  if (recipe != null) {
    cachedResult = `${folder}/${powers}`;
    cachedRecipe = recipe;
  }
  return recipe;
}

function LoadRecipes(recipes) {
  if (recipes == null)
    return false;
  if (recipes === true)
    return -1;
  const recipesList = GetRecipesListDiv();
  const allowedHerbas = GetAllowedHerbas();
  recipesList.innerHTML = "";
  for (const recipe of recipes) {
    if (((recipe) => {
        for (const condiment of recipe.condiments) {
          if (condiment.search("Herba") != -1 && !(condiment in allowedHerbas))
            return true;
        }
        return false;
      })(recipe)) {
      continue;
    }
    let text = "";
    text += "<div class=recipe style='flex-wrap: nowrap;'><div class=recipeleft><div class=recipetitle>";
    if ("name" in recipe)
      text += `<div class=recipename>${recipe.name}</div>`;
    else
      text += `<div class=recipename>A Tasty * Original</div>`;
    if ("id" in recipe)
      text += `<div class=recipeid>${recipe.id}</div>`;
    text += "</div><div class=fillingslist>";
    for (const filling of recipe.fillings) {
      text += `<div class=filling style="background-image: url('${sprites[filling]}');"><div>${filling}</div></div>`;
    }
    text += "</div><div class=condimentslist>";
    for (const condiment of recipe.condiments) {
      text += `<div class=condiment style="background-image: url('${sprites[condiment]}');"><div>${condiment}</div></div>`;
    }
    text += "</div></div><div class=reciperight><div class=mealpowerslist>";
    for (const mealPower of recipe.mealPowers) {
      const type = ("type" in mealPower) ? mealPower.type : "";
      const colon = ("type" in mealPower) ? ":" : "";
      text += `<div class=mealpower><div class=power>${mealPower.power}${colon}</div><div class=type>${type}</div><div class=level>Lv. ${mealPower.level}</div></div>`;
    }
    text += "</div></div></div>";
    recipesList.innerHTML += text;
  }
  if (recipesList.innerHTML == "") {
    recipesList.innerHTML = "<img src='sprites/crossmark.png'> All recipes hidden.";
  } else {
    for (const recipeDiv of document.getElementsByClassName("recipe")) {
      recipeDiv.style.setProperty("--nowrap-height", recipeDiv.offsetHeight);
      recipeDiv.style.removeProperty("flex-wrap");
    }
    FixWrapDivs();
  }
  return true;
}

function FixWrapDivs() {
  for (const recipeDiv of document.getElementsByClassName("recipe")) {
    recipeDiv.style.removeProperty("width");
    if (recipeDiv.offsetHeight > recipeDiv.style.getPropertyValue("--nowrap-height"))
      recipeDiv.style.width = "min-content";
  }
}

window.addEventListener("resize", (event) => {
  FixWrapDivs();
});