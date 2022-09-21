import axios from 'axios';

// Image Transformation
import { Resize } from '@cloudinary/url-gen/actions/resize';
import {
  imagekit,
  DEFAULT_IMAGEKIT_IMG,
  cloudinary,
  DEFAULT_CLOUDINARY_IMG,
} from './image';

export default async function generateNftUrl(image: string, size: string) {
  // fetch head only to get Content-Type to render NFT appropriately
  return await axios
    .head(image)
    .then((response) => {
      // get contentType
      let contentType = response.headers['content-type'];
      const contentLength = response.headers['content-length'];

      //console.log('contentType', contentType);

      console.log('test', image);

      if (contentType === 'image/gif') {
        console.log('gif', image);
        // Cloudinary
        // https://res.cloudinary.com/gladius/image/fetch/h_250,w_250/f_mp4/d_no-image_lmfa1g.png/https://www.thehighapesclub.com/assets/nft/invite/THCInvite.gif
        // Cloudinary 10MB Limit
        if (Number(contentLength) < 10250000) {
          // setImage(
          //   `https://res.cloudinary.com/gladius/image/fetch/h_250,w_250/f_mp4/d_no-image_lmfa1g.png/${nft.metadata.image}`
          // );

          image = `https://res.cloudinary.com/gladius/image/fetch/h_${size},w_${size}/f_mp4/d_no-image_lmfa1g.png/${image}`;

          contentType = 'video/mp4'; // gifs will be outputted as video/mp4
        } else {
          contentType = 'image/png';

          image = '/img/no-video.png';
        }

        // ImageKit
        /* setImage(
          imagekit.url({
            src: `${process.env.REACT_APP_IMAGEKIT_API_URL}/${image}`,
            transformation: [
              {
                height: '250',
                width: '250',
                defaultImage: DEFAULT_IMAGEKIT_IMG,
              },
            ],
          })
        ); */
      } else if (contentType === 'video/mp4' || contentType === 'video/webm') {
        // if (contentLength < 10250000) {

        console.log('video', image);

        if (Number(contentLength) < 100000000) {
          const stripped = image.replace(/^.*:\/\//i, '');

          const cloudinaryImage = cloudinary.video(
            `remote_https_media/${stripped}`
          );
          cloudinaryImage.resize(Resize.fit().width(size).height(size));

          let cloudinaryLink = cloudinaryImage.toURL();
          cloudinaryLink = cloudinaryLink + '/d_no-image_lmfa1g.png';

          //setImage(cloudinaryLink);
          image = cloudinaryLink;
        } else {
          contentType = 'image/png';

          //setImage('/img/no-video.png');
          image = '/img/no-video.png';
        }

        // ImageKit

        /* setImage(
          imagekit.url({
            src: `${process.env.REACT_APP_IMAGEKIT_API_URL}/${nft.metadata.image}`,
            transformation: [
              {
                height: '250',
                width: '250',
                defaultImage: DEFAULT_IMAGEKIT_IMG,
              },
            ],
          })
        ); */
      } else if (
        contentType !== 'model/gltf-binary' &&
        contentType !== 'image/svg+xml'
      ) {
        // ImageKit

        image = imagekit.url({
          src: `${process.env.REACT_APP_IMAGEKIT_API_URL}/${image}`,
          transformation: [
            {
              height: size,
              width: size,
              defaultImage: DEFAULT_IMAGEKIT_IMG,
            },
          ],
        });
      }

      return {
        image,
        contentType,
      };
    })
    .catch((err) => {
      // console.log(err);

      // if content-type fetch isn't successful, return a fallback
      return {
        image,
        contentType: 'image/png',
      };
    });
}
