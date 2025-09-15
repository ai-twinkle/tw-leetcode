function removeSubfolders(folder: string[]): string[] {
  // Lexicographically sort so that any sub-folder always follows its parent
  folder.sort();

  const filteredFolderList: string[] = [];
  // Track the last folder we kept, *with* a trailing "/" for fast prefix checks
  let lastKeptFolderPath = "";
  let lastKeptFolderPathWithSlash = "";

  for (const currentFolderPath of folder) {
    // If we haven’t kept anything yet, or this path does *not* start
    // with lastKeptFolderPath + "/" (i.e. is not a sub-folder), keep it:
    if (
      !lastKeptFolderPath ||
      !currentFolderPath.startsWith(lastKeptFolderPathWithSlash)
    ) {
      filteredFolderList.push(currentFolderPath);

      // Update our “parent” marker, appending "/" once for the next checks
      lastKeptFolderPath = currentFolderPath;
      lastKeptFolderPathWithSlash = currentFolderPath + "/";
    }
    // Otherwise it’s a sub-folder of lastKeptFolderPath → skip it
  }

  return filteredFolderList;
}
