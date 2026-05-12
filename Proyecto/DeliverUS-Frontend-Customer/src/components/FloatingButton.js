import React, { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { brandPrimary } from '../styles/GlobalStyles'
import { MaterialCommunityIcons } from '@expo/vector-icons'
/* 
    Nuevo componente que renderiza un botón flotante abajo a la derecha. 
    Se le puede añadir texto al pasarle el ratón por encima: textHover
    Declarar una función con onPress
    Que tenga un texto con title
    Un icono de MaterialCommunityIcons con iconName
    Y el estilo del contenedor que lo contiene
*/
export default function FloatingButton({
  title,
  onPress,
  textHover,
  iconName,
  containerStyle
}) {
  const [visible, setVisible] = useState(false)
  const [clicked, setClicked] = useState(false)
  return (
    <View style={[styles.container, containerStyle]}>
      {visible && textHover && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{textHover}</Text>
        </View>
      )}
      <Pressable
        style={({ pressed }) => [
          {
            borderWidth: 4,
            borderColor: brandPrimary,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            backgroundColor: brandPrimary,
            borderRadius: 5,
            opacity: pressed ? 0.7 : 1
          }
        ]}
        onPress={() => {
          setVisible(false)
          onPress()
          setClicked(prev => !prev)
        }}
        onHoverIn={() => {
          if (!clicked) {
            setVisible(true)
          }
        }}
        onHoverOut={() => setVisible(false)}
      >
        <MaterialCommunityIcons name={iconName} size={24} color="white" />
        <Text numberOfLines={1} style={{ color: 'white' }}>
          {title}
        </Text>
      </Pressable>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    position: 'absolute'
  },
  tooltip: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  tooltipText: {
    color: 'white'
  }
})
