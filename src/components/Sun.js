export default function Planets(props) {

    return(
        <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color="yellow" wireframe="true" />
        </mesh>
    )
}