const InfoIcon = ({ color="currentColor", className="", width="16", height="16"}) => {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg"
            width={width} height={height} viewBox="0 0 24 24"
            role="img" aria-labelledby="infoTitle infoDesc" focusable="false" fill={color}>
            <circle cx="12" cy="12" r="10" stroke={color} stroke-width="2" fill="none"/>
            <circle cx="12" cy="7" r="1.25" fill={color}/>
            <rect x="11" y="10" width="2" height="9" rx="0.75" fill={color}/>
        </svg>
    )
}

export default InfoIcon;