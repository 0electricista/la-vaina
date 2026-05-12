import { useEffect, useState, useContext } from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  ImageBackground,
  Image,
  Pressable,
  TextInput
} from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import TextError from '../../components/TextError'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { API_BASE_URL } from '@env'
import Ionicons from '@expo/vector-icons/Ionicons'
import FloatingButton from '../../components/FloatingButton'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { createOrder } from '../../api/OrderEndpoints'

export default function RestaurantDetailScreen({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [baseOrder, setBaseOrder] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)
  const [backendErrors, setBackendErrors] = useState()

  useEffect(() => {
    fetchRestaurantDetail()
  }, [route])

  const renderHeader = () => {
    return (
      <ImageBackground
        source={
          restaurant?.heroImage
            ? {
                uri: API_BASE_URL + '/' + restaurant.heroImage,
                cache: 'force-cache'
              }
            : undefined
        }
        style={styles.imageBackground}
      >
        <View style={styles.restaurantHeaderContainer}>
          <TextSemiBold textStyle={styles.textTitle}>
            {restaurant.name}
          </TextSemiBold>
          <Image
            style={styles.image}
            source={
              restaurant.logo
                ? {
                    uri: API_BASE_URL + '/' + restaurant.logo,
                    cache: 'force-cache'
                  }
                : undefined
            }
          />
          <TextRegular textStyle={styles.description}>
            {restaurant.description}
          </TextRegular>
          <TextRegular textStyle={styles.description}>
            {restaurant.restaurantCategory
              ? restaurant.restaurantCategory.name
              : ''}
          </TextRegular>
        </View>
      </ImageBackground>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={
          item.image ? { uri: API_BASE_URL + '/' + item.image } : undefined
        }
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>
          {item.price.toFixed(2)}€
        </TextSemiBold>
        {!item.availability && (
          <TextRegular textStyle={styles.availability}>
            Not available
          </TextRegular>
        )}
        {item.availability && (
          <View style={styles.orderContainer}>
            <Pressable
              style={styles.orderButton}
              onPress={() => reduceOrderNumber(item)}
            >
              <Ionicons name="remove" size={24} color="white" />
            </Pressable>
            <TextInput
              style={styles.orderInput}
              value={baseOrder[item.id]}
              onChangeText={text => changeText(item, text)}
            />
            <Pressable
              style={styles.orderButton}
              onPress={() => addOrderNumber(item)}
            >
              <Ionicons name="add" size={18} color="white" />
            </Pressable>
          </View>
        )}
      </ImageCard>
    )
  }
  const addOrderNumber = item => {
    const valor = baseOrder[item.id]
    setBaseOrder(prev => ({
      ...prev,
      [item.id]: valor + 1
    }))
  }

  const reduceOrderNumber = item => {
    const valor = baseOrder[item.id]
    if (valor > 0) {
      setBaseOrder(prev => ({
        ...prev,
        [item.id]: valor - 1
      }))
    }
  }

  const changeText = (item, text) =>
    setBaseOrder(prev => ({
      ...prev,
      [item.id]: Number(text)
    }))

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
      setBaseOrder(
        Object.fromEntries(fetchedRestaurant.products.map(obj => [obj.id, 0]))
      )
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  const handleConfirmOrder = async () => {
    setBackendErrors([])
    try {
      const order = {
        address: loggedInUser.address,
        restaurantId: route.params.id,
        products: Object.entries(baseOrder)
          .filter(([id, quantity]) => quantity > 0)
          .map(([id, quantity]) => ({
            productId: Number(id),
            quantity: quantity
          }))
      }
      await createOrder(order)
      showMessage({
        message: `Order successfully created!`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      restartBaseOrder()
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }
  const restartBaseOrder = () => {
    setBaseOrder(prev =>
      Object.fromEntries(Object.keys(prev).map(key => [key, 0]))
    )
  }
  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyProductsList}
        style={styles.container}
        data={restaurant.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
      />
      {backendErrors &&
        backendErrors.map((error, index) => (
          <TextError key={index}>
            {error.param}-{error.msg}
          </TextError>
        ))}
      {restaurant?.products?.length > 0 && (
        <>
          <FloatingButton
            title={'Confirm order'}
            onPress={() => {
              if (!loggedInUser) {
                showMessage({
                  message: `Please login before confirming your order`,
                  type: 'error',
                  style: GlobalStyles.flashStyle,
                  titleStyle: GlobalStyles.flashTextStyle
                })
              } else {
                handleConfirmOrder()
              }
            }}
            iconName={'sticker-check'}
            containerStyle={{ right: 20, bottom: 40 }}
            textHover={'Confirms your order'}
          ></FloatingButton>
          <FloatingButton
            title={'Discard order'}
            iconName={'basket-remove-outline'}
            containerStyle={{ right: 160, bottom: 40 }}
            textHover={'Discards your order'}
            onPress={() => {
              restartBaseOrder()
            }}
          ></FloatingButton>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  orderButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GlobalStyles.brandPrimary
  },
  orderContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    overflow: 'hidden'
  },
  orderInput: {
    width: 36,
    height: 28,
    textAlign: 'center',
    padding: 0,
    paddingVertical: 0,
    includeFontPadding: false,
    lineHeight: 28
  }
})
