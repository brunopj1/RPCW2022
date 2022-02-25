import json
import re
from unicodedata import lookup

# region Templates HTML

templateMovie = """<!doctype html>
<html>
    <head>
        <title>$(TITLE)</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>$(TITLE)</h1>
        <h2>Year</h2>
        <p>$(YEAR)</p>
        <h2>Genres</h2>
        <ul>
$(GENRES)
        </ul>
        <h2>Cast</h2>
        <ul>
$(CAST)
        </ul>
    </body>
</html>"""

templateMovieGenre = "            <li>$(GENRE)</li>\n"
templateMovieActor = "            <li><a href=\"$(REF)\">$(ACTOR)</a></li>\n"

templateActor = """<!doctype html>
<html>
    <head>
        <title>$(NAME)</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>$(NAME)</h1>
        <h2>Movies</h2>
        <ul>
$(MOVIES)
        </ul>
    </body>
</html>"""

templateActorMovie = "            <li><a href=\"$(REF)\">$(TITLE)</a></li>\n"

templateMoviesOrd = """<!doctype html>
<html>
    <head>
        <title>Movies</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>Movies</h1>
        <ul>
$(MOVIES)     
        </ul>
    </body>
</html>"""

templateMoviesOrdAnchor = "          <li><a href=\"$(REF)\">$(TITLE)</a></li>\n"

templateActorsOrd = """<!doctype html>
<html>
    <head>
        <title>Actors</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>Actors</h1>
        <ul>
$(ACTORS)     
        </ul>
    </body>
</html>"""

templateActorsOrdAnchor = "          <li><a href=\"$(REF)\">$(NAME)</a></li>\n"

#endregion

# returns:
#   - movieLookupTable: 
#       movieIdx -> (normalizedTitle, json_entry)
#   - actorLookupTable:
#       actorIdx -> (normalizedName, name, [movieIndex])
#   - actorHash:
#       actorNormalizedName -> actorIdx
def parseJSON(path):
    
    file = open(path, "r", encoding="utf-8")
    jsonObj = json.loads(file.read())
    file.close()

    movieLookupTable = {}
    actorLookupTable = {}
    actorHash = {}
    movieCount = 0
    actorCount = 0

    for movie in jsonObj:

        # Movie filepath
        normalizedTitle = re.sub(r'[^a-zA-Z0-9 \-_]', "", movie["title"]).replace(" ", "_")
        movieCount += 1
        movieIndex = "f" + str(movieCount)
        movieLookupTable[movieIndex] = (normalizedTitle, movie)

        # Actor filepaths
        for actor in movie["cast"]:

            normalizedName = re.sub(r'[^a-zA-Z0-9 \-_]', "", actor).replace(" ", "_")
            
            # If actor is new add to set
            if normalizedName not in actorHash.keys():
                actorCount += 1
                actorIndex = "a" + str(actorCount)
                actorLookupTable[actorIndex] = (normalizedName, actor, [movieIndex])
                actorHash[normalizedName] = actorIndex
            
            #  Update actor's movies
            else:
                actorIndex = actorHash[normalizedName]
                actorLookupTable[actorIndex][2].append(movieIndex)

    return (movieLookupTable, actorLookupTable, actorHash)

def createMoviePages(movieLookupTable, actorLookupTable, actorHash):
    
    for normalizedTitle, movie in movieLookupTable.values():
        
        doc = templateMovie

        # Write Title / Year
        doc = doc.replace("$(TITLE)", movie["title"])
        doc = doc.replace("$(YEAR)", str(movie["year"]))

        # Write Genres
        genres = ""
        for genre in movie["genres"]:
            genres += templateMovieGenre.replace("$(GENRE)", genre)
        doc = doc.replace("$(GENRES)", genres[:-1])

        # Write Cast
        cast = ""
        for actor in movie["cast"]:
            actorNormalizedName = re.sub(r'[^a-zA-Z0-9 \-_]', "", actor).replace(" ", "_")
            ref = "/actors/" + actorHash[actorNormalizedName]
            cast += templateMovieActor.replace("$(ACTOR)", actor).replace("$(REF)", ref)
        doc = doc.replace("$(CAST)", cast[:-1])
        
        # Save file
        filepath = "./Movies/" + normalizedTitle + ".html"
        with open(filepath, "w", encoding="utf-8") as _f:
            _f.truncate()
            _f.write(doc)

def createActorPages(movieLookupTable, actorLookupTable):
    
    for normalizedName, name, movies in actorLookupTable.values():
        
        # Actor Name
        doc = templateActor.replace("$(NAME)", name)

        # Actor Movies
        moviesStr = ""
        for movie in movies:
            ref = "/movies/" + movie
            movieTitle = movieLookupTable[movie][1]["title"]
            moviesStr += templateActorMovie.replace("$(TITLE)", movieTitle).replace("$(REF)", ref)
        doc = doc.replace("$(MOVIES)", moviesStr[:-1])

        # Save file
        filepath = "./Actors/" + normalizedName + ".html"
        with open(filepath, "w", encoding="utf-8") as f:
            f.truncate()
            f.write(doc)

def createOrderedMoviesPage(movieLookupTable):

    movies = ""
    temp = sorted(movieLookupTable.items(), key=lambda item: item[1][0])
    for idx, (normalizeTitle, movie) in temp:
        title = movie["title"]
        ref = "/movies/" + idx
        movies += templateMoviesOrdAnchor.replace("$(TITLE)", title).replace("$(REF)", ref)
    doc = templateMoviesOrd.replace("$(MOVIES)", movies[:-1])

    # Save the ordered movies html
    with open("./orderedMovies.html", "w", encoding="utf-8") as f:
        f.truncate()
        f.write(doc)

def createOrderedActorsPage(actorLookupTable):
    
    actors = ""
    temp = sorted(actorLookupTable.items(), key=lambda item: item[1][0])
    for idx, (normalizedName, name, movies) in temp:
        ref = "/actors/" + idx
        actors += templateActorsOrdAnchor.replace("$(NAME)", name).replace("$(REF)", ref)
    doc = templateActorsOrd.replace("$(ACTORS)", actors[:-1])

    # Save the ordered movies html
    with open("./orderedActors.html", "w", encoding="utf-8") as f:
        f.truncate()
        f.write(doc)

def saveMovieLookupTable(movieLookupTable):
    temp = {idx: "./Movies/" + normalizedName + ".html" for idx, (normalizedName, movie) in movieLookupTable.items()}
    with open("./movieLookupTable.json", "w", encoding="utf-8") as f:
        f.truncate()
        json.dump(temp, f, indent=True)

def saveActorLookupTable(actorLookupTable):
    temp = {idx: "./Actors/" + normalizedName + ".html" for idx, (normalizedName, name, movie) in actorLookupTable.items()}
    with open("./actorLookupTable.json", "w", encoding="utf-8") as f:
        f.truncate()
        json.dump(temp, f, indent=True)

#region Script

movieLookupTable, actorLookupTable, actorHash = parseJSON("./movies.json")

createMoviePages(movieLookupTable, actorLookupTable, actorHash)
createActorPages(movieLookupTable, actorLookupTable)

createOrderedMoviesPage(movieLookupTable)
createOrderedActorsPage(actorLookupTable)

saveMovieLookupTable(movieLookupTable)
saveActorLookupTable(actorLookupTable)

#endregion