import { FlatList, StyleSheet, View, Pressable } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import React, { useContext, useEffect, useState } from 'react'
import { brandPrimary, brandPrimaryTap } from '../../styles/GlobalStyles'
import { getDetail, getUserOrders } from '../../api/OrderEndpoints'
import DeleteModal from '../../../../DeliverUS-Frontend-Customer/src/components/DeleteModal'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import { API_BASE_URL } from '@env'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function OrderDetailScreen({ navigation, route }) {
  const [order, setOrder] = useState([])

  useEffect(() => {
    fetchOrder()
  }, [route])

  const fetchOrder = async () => {
    try {
      const fetchedProducts = await getDetail(route.params.id)
      setOrder(fetchedProducts)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving productos from the order. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={
          item.image ? { uri: API_BASE_URL + '/' + item.image } : undefined
        }
        title={item.name}
      >
        <TextRegular textStyle={styles.text} numberOfLines={2}>
          Unidades:
          {item.OrderProducts.quantity}
        </TextRegular>
        <TextRegular textStyle={styles.text} numberOfLines={2}>
          {item.OrderProducts.unityPrice}€
        </TextRegular>
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No products from the order were retreived.
      </TextRegular>
    )
  }

  return (
    <>
      <FlatList
        style={styles.container}
        data={order.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyProductsList}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  text: {
    fontSize: 18,
    color: 'black'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
