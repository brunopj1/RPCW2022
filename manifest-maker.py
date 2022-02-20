from os import listdir
from os.path import isfile, isdir, join
from datetime import date

# Variaveis
titulo = "Janelas: O Sistema Operativo"
path = "./RPCW2022/TP1/"
autor = "Bruno Pinto Jácome"
resumo = [ # Lista de paragrafos (Tabs são postos automaticamente)
    "Este trabalho fala sobre o sistema operativo Windows (ou em portugues: Janelas)"
    ]

def putFolder(path, tabCount):
    content = ""

    # Folders
    for folder in listdir(path):
        if isdir(join(path, folder)):
            content += "\t" * tabCount + f"<pasta nome=\"{folder}\">\n"
            content += putFolder(path + folder + "/", tabCount + 1)
            content += "\t" * tabCount + f"</pasta>\n"

    # Files
    for file in listdir(path):
        if isfile(join(path, file)):
            content += "\t" * tabCount + f"<ficheiro>{file}</ficheiro>\n"
    
    return content

# Get TPC number
content = "<manifesto>\n"
content += f"\t<title>{titulo}</title>\n"
data = date.today().strftime("%d/%m/%Y")
content += f"\t<data>{data}</data>\n"
content += f"\t<autor>{autor}</autor>\n"
content += "\t<UC>Representação e Processamento de Conhecimento na Web</UC>\n"
content += "\t<resumo>\n"
for par in resumo:
    content += f"\t\t{par}\n"
content += "\t</resumo>\n"
content += "\t<ficheiros>\n"
content += putFolder(path, 2)
content += "\t</ficheiros>\n"
content += "</manifesto>"

content = content.replace("\t\t<ficheiro>manifesto.xml</ficheiro>\n", "")

with open("manifesto.xml", "w", encoding="utf-8") as f:
    f.truncate()
    f.write(content)