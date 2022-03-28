import re

# Read file
with open("./db.json", "r", encoding="utf-8") as file:
    content = file.readlines()

# Variables
newContent = ""
id = 1

for line in content:
    if res := re.match(r"(\s+\{)(\"prov\".+)", line):
        newContent += res.group(1) + "\"id\":" + str(id) + "," + res.group(2) + "\n"
        id += 1
    else:
        newContent += line

# Write file
with open("./db.json", "w", encoding="utf-8") as file:
    file.truncate()
    file.write(newContent)