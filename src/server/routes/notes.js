import express from 'express'
import { s3 } from '../database.js'

const router = express.Router()

router.get('/readNote/*filePath', async (req, res) => {
  const filePath = req.params.filePath
  if (filePath[filePath.length - 1] === '') {
    return res.status(403).send({ message: 'A note\'s path cannot end in \'/\' ' })
  }

  try {
    const result = await s3.getObject({
      Bucket: 'notesbucket27',
      Key: filePath.join('/')
    })

    const str = await result.Body.transformToString()
    return res.status(200).json(str)
  } catch (e) {
    return res.status(504).send({ message: `Error from S3 while getting object from 'notesbucket27'.  ${e.name}: ${e.message}` })
  }
})

router.put('/updateNote/*filePath', async (req, res) => {
  const filePath = req.params.filePath

  if (filePath[filePath.length - 1] === '') {
    return res.status(403).send({ message: 'A note\'s path cannot end in \'/\' ' })
  }

  const parentPath = filePath.slice(0, -1).join('/') + '/'

  try {
    const parentCheck = await s3.listObjectsV2({
      Bucket: 'notesbucket27',
      Prefix: parentPath,
      MaxKeys: 1
    })

    if (parentCheck.KeyCount === 0 && parentPath !== '/') {
      return res.status(404).send({ message: `Parent path ${parentPath} does not exist` })
    }

    const folderExists = await s3.listObjectsV2({
      Bucket: 'notesbucket27',
      Key: filePath.join('/'),
      MaxKeys: 1
    })

    if (folderExists.KeyCount === 0) {
      return res.status(404).send({ message: `Folder ${filePath.join('/')} does not exist` })
    }

    await s3.putObject({
      Bucket: 'notesbucket27',
      Key: filePath.join('/'),
      Body: req.body.fileContent
    })

    return res.status(200).send({ message: `Note ${filePath.join('/')} updated Successfully` })
  } catch (e) {
    return res.status(500).send({ message: `Error updating note: ${e}` })
  }
})

router.post('/createNote/*filePath', async (req, res) => {
  const filePath = req.params.filePath

  if (filePath[filePath.length - 1] === '') {
    return res.status(403).send({ message: 'A note\'s path cannot end in \'/\' ' })
  }

  try {
    await s3.putObject({
      Bucket: 'notesbucket27',
      Key: filePath.join('/'),
      Body: ' '
    })

    res.status(200).send({ message: 'Created note succesfuly' })
  } catch (e) {
    return res.status(500).send({ message: `Error creating note: ${e}` })
  }
})

router.delete('/deleteNote/*filePath', async (req, res) => {
  const filePath = req.params.filePath

  if (filePath[filePath.length - 1] === '') {
    return res.status(403).send({ message: 'A note\'s path cannot end in \'/\' ' })
  }

  try {
    await s3.deleteObject({
      Bucket: 'notesbucket27',
      Key: filePath.join('/')
    })

    return res.status(200).send({ message: `The object "${filePath.join('/')}" from bucket "notesbucket27" was deleted, or it didn't exist.` })
  } catch (e) {
    return res.status(500).send({ message: `Error creating note: ${e}` })
  }
})

router.put('/renameNote/*filePath', async (req, res) => {
  const filePath = req.params.filePath
  const newName = req.body.newName
  const newPath = filePath.slice(0, filePath.length - 1).join('/') + '/' + newName

  if (filePath[filePath.length - 1] === '') {
    return res.status(403).send({ message: 'A note\'s path cannot end in \'/\' ' })
  }

  if (newName.includes('/')) {
    return res.status(403).send({ message: 'A note\'s name cannot contain\'/\' ' })
  }

  try {
    await s3.copyObject({
      Bucket: 'notesbucket27',
      CopySource: `notesbucket27/${filePath.join('/')}`,
      Key: newPath
    })

    await s3.deleteObject({
      Bucket: 'notesbucket27',
      Key: filePath.join('/')
    })

    return res.status(200).send({ message: `Renamed note ${filePath.join('/')} to ${newPath}` })
  } catch (e) {
    return res.status(500).send({ message: `Error creating note: ${e}` })
  }
})

export default router
