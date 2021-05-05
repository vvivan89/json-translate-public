# JSON Translation tool
This tool helps to translate data in JSON format allowing to select particular keys to translate

# Features
- Automated Google translation of JSON data
- Usage of glossary to translate specific words/phrases in a desired way
- Ability to manually correct the translation
- **Selection of JSON keys to translate**
- API usage statistics for logged users

# Why?
To fill the database for my mobile app [Flying Floof](https://github.com/vvivan89/Flying-Floof-public), 
I create JSON files with airline data. As the app is multilingual, I had to create several versions of the save JSONs
with basically the same data. Most of the free tools that help to translate JSON files, thanslate the whole file and I
don't want it. So first I made this tool privately, only for me, but now it is available for everyone with one condition:
you need your own Google Transaltion API key.

### Stack
- React
- Bootstrap (actually, component-based [react-bootstrap](https://react-bootstrap.github.io/))
- Google Firebase (auth/firestore)

#### [Try it here](https://translate-json.web.app/)
