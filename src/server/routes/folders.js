import express from 'express'
import { s3 } from '../database.js'
import { authenticateToken } from './users.js'

const router = express.Router()

router.post('/createFolder/*folderPath', authenticateToken, async (req, res) => {
  const folderPath = req.params.folderPath

  if (!(folderPath[folderPath.length - 1] === '')) {
    return res.status(403).send({ message: 'A folders\'s path must end in \'/\' ' })
  }

  try {
    await s3.putObject({
      Bucket: 'notesbucket27',
      Key: folderPath.join('/'),
      Body: ''
    })

    return res.status(200).send({ message: `Folder ${folderPath.join('/')} created succesfully` })
  } catch (e) {
    return res.status(500).send({ message: `Error creating folder ${e}` })
  }
})

router.delete('/deleteFolder/*folderPath', authenticateToken, async (req, res) => {
  const folderPath = req.params.folderPath

  if (!(folderPath[folderPath.length - 1] === '')) {
    return res.status(403).send({ message: 'A folders\'s path must end in \'/\' ' })
  }

  try {
    const listedObjects = await s3.listObjectsV2({
      Bucket: 'notesbucket27',
      Prefix: folderPath.join('/')
    })
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return res.status(401).send({ message: `Folder ${folderPath.join('/')} does not exist, or it is already empty` })
    }

    const objectsToDelete = listedObjects.Contents.map(obj => ({ Key: obj.Key }))

    const deleteParams = {
      Bucket: 'notesbucket27',
      Delete: { Objects: objectsToDelete }
    }

    const result = await s3.deleteObjects(deleteParams)

    return res.status(200).send({
      message: `Folder ${folderPath.join('/')} and its contents were deleted succesfully`,
      deleted: result.Deleted.map(obj => obj.Key)
    })
  } catch (e) {
    return res.status(500).send({ message: `Error deleting folder ${e}` })
  }
})

router.put('/renameFolder/*folderPath', authenticateToken, async (req, res) => {
  const folderPath = req.params.folderPath
  const newFolderName = req.body.newName

  const parentPath = folderPath.slice(0, folderPath.length - 2).join('/') + '/'
  const newPath = parentPath === '/' ? newFolderName + '/' : parentPath + newFolderName + '/'

  if (!(folderPath[folderPath.length - 1] === '')) {
    return res.status(403).send({ message: 'A folders\'s path must end in \'/\' ' })
  }

  if (newFolderName.includes('/')) {
    return res.status(403).send({ message: 'A folder\'s name cannot contain \'/\' ' })
  }

  try {
    const newFolderCheck = await s3.listObjectsV2({
      Bucket: 'notesbucket27',
      Prefix: newPath,
      MaxKeys: 1
    })

    console.log(newFolderCheck)
    if (newFolderCheck.KeyCount > 0) {
      return res.status(409).send({ message: `A folder with ${newFolderName} already exists at this location` })
    }

    const listedObjects = await s3.listObjectsV2({
      Bucket: 'notesbucket27',
      Prefix: folderPath.join('/')
    })

    for (const obj of listedObjects.Contents) {
      const oldKey = obj.Key
      const newKey = oldKey.replace(folderPath.join('/'), newPath)

      console.log(`Renaming ${oldKey} to ${newKey}`)
      await s3.copyObject({
        Bucket: 'notesbucket27',
        CopySource: `notesbucket27/${oldKey}`,
        Key: newKey
      })

      await s3.deleteObject({
        Bucket: 'notesbucket27',
        Key: oldKey
      })
    }

    return res.status(200).send({ message: `Folder renamed to ${newFolderName}` })
  } catch (e) {
    return res.status(500).send({ message: `Error renaming folder: ${e}` })
  }
})

export default router
