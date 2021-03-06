import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useCart from "../../hooks/useCart";
import { addToDb, getStoredCart } from "../../utilities/fakedb";
import Cart from "../Cart/Cart";
import Product from "../Product/Product";
import "./Shop.css";
const Shop = () => {
	const [products, setProducts] = useState([]);
	const [cart, setCart] = useCart();
	// products to the render on the UI
	const [displayProducts, setDisplayProducts] = useState([]);
	const [pageCount, setPageCount] = useState(0);
	const [page, setPage] = useState(0);
	// hard code page size
	const size = 10;
	useEffect(() => {
		// console.log('api called');
		fetch(`http://localhost:5000/products?page=${page}&&size=${size}`)
			.then((res) => res.json())
			.then((data) => {
				setProducts(data.products);
				setDisplayProducts(data.products);
				// console.log('api received');
				const count = data.count;
				const pageNumber = Math.ceil(count / size);
				setPageCount(pageNumber);
			});
	}, [page]);

	useEffect(() => {
		// console.log('localStorage called');
		if (products.length) {
			const savedCart = getStoredCart(); /// fakedata theke eikhane call kora hoise
			// console.log(savedCart);
			const storedCart = [];
			for (const key in savedCart) {
				// console.log(key, products);
				// console.log(key, savedCart[key]);
				const addedProduct = products.find((product) => product.key === key);
				//   console.log(key,addedProduct);
				if (addedProduct) {
					const quantity = savedCart[key];
					addedProduct.quantity = quantity;
					// console.log(addedProduct);
					storedCart.push(addedProduct);
				}
			}
			setCart(storedCart);
		}
	}, []);
	const handleAddToCart = (product) => {
		const exists = cart.find((pd) => pd.key === product.key);
		let newCart = [];
		if (exists) {
			const rest = cart.filter((pd) => pd.key !== product.key);
			exists.quantity = exists.quantity + 1;
			newCart = [...rest, product];
		} else {
			product.quantity = 1;
			newCart = [...cart, product];
		}
		setCart(newCart);
		addToDb(product.key);
	};
	const hendleSearch = (event) => {
		const searchText = event.target.value;
		const matchedProducts = products.filter((product) =>
			product.name.toLowerCase().includes(searchText.toLowerCase())
		);
		setDisplayProducts(matchedProducts);
		console.log(matchedProducts.length);
	};
	return (
		<>
			<div className="search-container">
				<input
					onChange={hendleSearch}
					type="text"
					placeholder="search product"
				/>
			</div>
			{displayProducts.length === 0 ? (
				<h2 style={{ textAlign: "center", color: "green", fontWeight: "bold" }}>
					Loading{" "}
					<strong style={{ fontSize: "70px" }}>
						. .. ... .... ..... ....... ........... ..............
					</strong>
				</h2>
			) : (
				<div className="shop-container">
					<div className="product-container">
						{displayProducts.map((product) => (
							<Product
								key={product.key} //uniqe key use to removed consol warning
								product={product}
								handleAddToCart={handleAddToCart}
							></Product>
						))}
						{/* pagination korar jonno   */}
						<div className="pagination">
							{[...Array(pageCount).keys()].map((number) => (
								<button
									// conditional css class
									className={number === page ? "selected" : ""}
									keys={number}
									onClick={() => setPage(number)}
								>
									{number + 1}
								</button>
							))}
						</div>
					</div>
					<div className="cart-container">
						<Cart cart={cart}>
							<Link to="/review">
								<button className="btn-regular">order your review</button>
							</Link>
						</Cart>
					</div>
				</div>
			)}
		</>
	);
};

export default Shop;
