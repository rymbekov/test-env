import React from 'react';
import Icon from '../components/Icon';

/**
 * ImageSlider
 * @param {Object} props
 * @param {Array} props.options
 * @param {String} props.value
 * @param {Function} props.onChange
 * @returns {JSX}
 */
export default function ImageSlider({ options, value, onChange }) {
	const onChoose = (e, index) => {
		onChange(e, options[index].value);
	};

	const openExample = link => {
		window.open(link, '_blank');
	};

	const act = options.find(opt => opt.value === value);
	const indexOfAct = options.indexOf(act);

	const renderInnerItem = item => {
		const imgs = options.map(i => i.img);

		return (
			<div className="imageSlider__container__item" key={item.value}>
				<div className="imageSlider__img__container">
					{imgs.map(img => {
						return (
							<img
								src={img}
								className={`imageSlider__img imageSlider__img${img === item.img ? '__active' : '__inActive'}`}
								key={img}
							/>
						);
					})}
				</div>
				<div className="imageSlider__previewLinkHolder">
					<span
						className="imageSlider__previewLink"
						onClick={() => {
							openExample(item.example);
						}}
					>
						Live preview
					</span>
				</div>
			</div>
		);
	};

	return (
		<div className="imageSlider">
			<div className="imageSlider__container">
				<div className="imageSlider__container__inner">{renderInnerItem(act)}</div>
				{indexOfAct !== 0 && (
					<div
						className="imageSlider__container__prev"
						onClick={e => {
							onChoose(e, indexOfAct - 1);
						}}
					>
						<Icon name="arrowPrevPreview" />
					</div>
				)}
				{indexOfAct + 1 < options.length && (
					<div
						className="imageSlider__container__next"
						onClick={e => {
							onChoose(e, indexOfAct + 1);
						}}
					>
						<Icon name="arrowNextPreview" />
					</div>
				)}
			</div>
		</div>
	);
}
