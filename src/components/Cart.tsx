import { useNavigate } from "react-router-dom"; // Add this import
import { CartCount, CartWrapper } from "../AppStyles";
import { CartIcon } from "../icons/icons";
import { CartButton } from "./MusicPlayerStyles";

const Cart: React.FC<{ cart: string[]; isVisible: boolean }> = ({
  cart,
  isVisible,
}) => {
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate("/checkout");
  };

  return (
    <CartWrapper $visible={isVisible}>
      <CartButton $filled={true} onClick={handleCartClick}>
        <CartIcon filled={true} />
        {isVisible && cart.length > 0 && <CartCount>{cart.length}</CartCount>}
      </CartButton>
    </CartWrapper>
  );
};

export default Cart;
