

const Image = (props:imageProps) => {
const {urls,alt_description,user,likes}=props.image;
  return (
    <>
      
        <section className="img-box">
          <img
            className="img"
            src={urls.regular}
            alt={alt_description}
          />
          <article className="info">
            <section>
              <span>{user.name}</span>
              <span>{likes} likes</span>
            </section>
            <img
              className="avatar"
              alt={user.bio}
              src={user.profile_image.medium}
            />
          </article>
        </section>
      
    </>
  );
};
interface imageProps {
 image:any;   
}
export default Image;
