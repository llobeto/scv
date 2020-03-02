module.exports = {
    //DB file path from project root
    DATA_FOLDER: 'db',
    PORT: process.argv[2] && Number.parseInt(process.argv[2]) || 8081
}