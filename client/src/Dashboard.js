import { useState, useEffect} from 'react'
import useAuth from './useAuth'
import { Container, Form } from 'react-bootstrap'
import TrackSearchResult from './TrackSearchResult'
import SpotifyWebApi from 'spotify-web-api-node'
import Player from './Player'

const spotifyApi = new SpotifyWebApi({
        clientId: process.env.REACT_APP_CLIENT_ID,
        clientSecret: process.env.REACT_APP_CLIENT_SECRET,
})
export default function Dashboard({code}) {
    const accessToken = useAuth(code)
    const [search ,setSearch] = useState("")
    const [searchResults ,setSearchResults] = useState([])
    const [playingTrack, setPlayingTrack] = useState()

    console.log(searchResults)

    function chooseTrack(track) {
        setPlayingTrack(track)
        setSearch("")
       // setLyrics("")
      }

    useEffect(() => {
        if (!accessToken) return
        spotifyApi.setAccessToken(accessToken)
    }, [accessToken])

    useEffect(() => {
        if (!search) return setSearchResults([])
        if (!accessToken) return
    
        let cancel = false
        spotifyApi.searchTracks(search).then(res => {
          if (cancel) return
          setSearchResults(
            res.body.tracks.items.map(track => {
              const smallestAlbumImage = track.album.images.reduce(
                (smallest, image) => {
                  if (image.height < smallest.height) return image
                  return smallest
                },
                track.album.images[0]
              )
    
              return {
                artist: track.artists[0].name,
                title: track.name,
                uri: track.uri,
                albumUrl: smallestAlbumImage.url,
              }
            })
          )
        })
    
        return () => (cancel = true)
      }, [search, accessToken])
    return (
        <Container className="d-flex flex-column py-2"
            style={{
                height: "100vh"
            }}
        >
        <Form.Control type="search" placeholder="Search Songs/Artists" value={search} onChange={
            (e) => {
                setSearch(e.target.value);
            }
        }>
        </Form.Control>

        <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResults.map(track => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))} 
        </div>
        <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />

            </div>
        </Container>
    )
}
