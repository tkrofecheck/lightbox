Image Search with Lightbox!
===================


To initialize the Image Search, place the below script where you want the Image Search initialized:

> **Initial Setup**
> 
> Place the below `<link>` tag in the `<head>` of your HTML page.
> `<link href="[path-to-file]/lightbox.css" rel="stylesheet"/>`
> 
> Replace the ***[path-to-file]*** with the location you are loading `lightbox.css` from.
> 
> Place the below `<script>` tag where you'd like the Lightbox image search loaded into your webpage. 
> 
> `<script src="[path-to-file]/lightbox.js"></script>`
> 
> Replace the ***[path-to-file]*** with the location you are loading `lightbox.js` from.
> 
> Next we need to create a new instance off of the `Lightbox`constructor.
> 
> **Code (inside `<script></script>`):**
> 
> `var Gallery = new Lightbox();`
> 
> NOTE: Any variable may be used, however you must use the same variable
> name to initialize (see below). Gallery.init();


----------


> **Google API Key**
> 
> GET an API Key with Google here:
> [https://developers.google.com/custom-search/json-api/v1/overview](https://developers.google.com/custom-search/json-api/v1/overview)
> 
> **The Google API Key is required!**


----------


> **Configuration**
> 
> Setup a config object (inside `<script></script>`) and pass into `new Lightbox()`
> 
>     var config = { apiKey: "Google_API_Key" }; // API Key is type string
> 
> Full example with default configuration. Remember the API Key is not a
> configuration, but a requirement so make sure to get your Google API Key.
> 
>     <script src="[path-to-file]/lightbox.js"></script>
>     <script>
>          var config = { apiKey: [Google_API_Key] };
>          var Gallery;
> 	     
> 	     Gallery = new Lightbox(config);
>          Gallery.init();
>     </script>
> 
> >Other configurations are available...
> 
> **cachePrefix**
> type: *`string`*
> default value: **`lbsearch_`**
> Used to cache response text when searching for the same exact query twice.
> 
> **containerName**
> type: *`string`*
> default value: **`lb-container`**
> The container name to insert the Image Search.
> 
> **create_SearchBox**
> type: *`boolean`*
> default value: **`true`**
> `true`: create search box
> `false`: do not create search box
> 
> **create_Dropdown**
> type: *`boolean`*
> default value: **`false`**
> `true`: create dropdown search
> `false`: do not create dropdown search
> Dependency: **presetDropdownJson** (see below)
> 
> NOTE: If **create_SearchBox** and **createDropdown** are both **`true`**, a toggle will be displayed.
> 
> **monitorConnection**
> type: *`boolean`*
> default value: **`false`**
> `true` display connection status
> `false` do not display connection status
> 
> **presetDropdownJson**
> type: *`string`* or *`object`*
> string: **[file-path]/[file-name].json**
> object: `json`
> This is used to populate the dropdown when **create_Dropdown** is set to `true`.
> 
> The json object in either the JSON file, or object passed must be setup following the below example:
> 
    {
	    "topics": [
	        {
	            "name" : "Halloween",
	            "options" : ["pumpkin", "witch", "ghost", "scarecrow", "clown"]
	        },
	        {
	            "name" : "New York City",
	            "options" : ["statue of liberty", "times square", "empire state building", "central park", "city hall"]
	        },
	        {
	            "name" : "Food",
	            "options" : ["pizza", "cheeseburger", "salad", "fruit", "baked potato"]
	        }
	    ]
    }

> **searchName**
> type: *`string`*
> default value: **`Image Search`**
> The title displayed on the page for you Image Search

Have fun!
----------------------------