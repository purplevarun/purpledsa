import { Link } from "react-router-dom";

const HeaderLeft = () => {
	return (
		<Link to="/" className="brand" aria-label="PurpleDSA Home">
			<img src="/pdsa-icon.svg" alt="Purple DSA" />
		</Link>
	);
};

export default HeaderLeft;
