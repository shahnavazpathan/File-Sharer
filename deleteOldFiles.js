const fs = require("fs");
const path = require("path");

const upload_dir = path.join(__dirname, "uploads");

const deleteOldFiles = () => {
  fs.readdir(upload_dir, (err, files) => {
    if (err) {
      return console.log("Error while getting the list of files");
    }
    files.forEach((file) => {
      const filepath = path.join(upload_dir, file);
      fs.stat(filepath, (err, stats) => {
        if (err) {
          return console.log("Error while getting the file stats");
        }
        const fileAge = ( Date.now() - stats.mtime );

        if (fileAge > 900000) {
            fs.unlink(filepath, (err) => {
                if (err) {
                    return console.log("Error while deleting file");
                    
                }
                console.log("File Deleted Successfully");
                
            })
        }
      });
    });
  });
};
module.exports = deleteOldFiles;