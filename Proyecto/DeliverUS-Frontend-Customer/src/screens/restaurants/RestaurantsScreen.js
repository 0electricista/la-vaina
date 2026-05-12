import { useEffect, useState } from 'react'
import { StyleSheet, FlatList, View } from 'react-native'
import TextSemiBold from '../../components/TextSemiBold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles' //Imported globally to practise a different import style unlike that of RestaurantDetailScreen
import { getAll } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import { API_BASE_URL } from '@env'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import product from '../../../assets/product.jpeg'
import { getTopThreeProducts } from '../../api/ProductEndpoints'
import FloatingButton from '../../components/FloatingButton'

export default function RestaurantsScreen({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [topThreeProducts, setTopThreeProducts] = useState([])
  const [visible, setVisible] = useState(false)

  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getAll()
      setRestaurants(fetchedRestaurants)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retrieved.
      </TextRegular>
    )
  }
  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={
          item.logo ? { uri: API_BASE_URL + '/' + item.logo } : restaurantLogo
        }
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null && (
          <TextSemiBold>
            Avg. service time:{' '}
            <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
              {item.averageServiceMinutes.toFixed(2)} min.
            </TextSemiBold>
          </TextSemiBold>
        )}
        <TextSemiBold>
          Shipping:{' '}
          <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
            {item.shippingCosts.toFixed(2)}€
          </TextSemiBold>
        </TextSemiBold>
      </ImageCard>
    )
  }
  const fetchTopThreeProducts = async () => {
    try {
      const topThree = await getTopThreeProducts()
      setTopThreeProducts(topThree)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving top three products. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  useEffect(() => {
    fetchRestaurants()
    fetchTopThreeProducts()
  }, [route])

  const renderTopThree = item => {
    return (
      <ImageCard
        imageUri={
          item.image ? { uri: API_BASE_URL + '/' + item.image } : product
        }
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', {
            id: item.restaurantId
          })
        }}
      >
        <TextRegular>{item.description}</TextRegular>
        <TextSemiBold>{item.price.toFixed(2)}€</TextSemiBold>
      </ImageCard>
    )
  }
  return (
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyRestaurantsList}
      />
      {visible && (
        <View style={styles.topThreePopup}>
          {topThreeProducts.map(item => renderTopThree(item))}
        </View>
      )}
      <FloatingButton
        title={'Top 3 Products'}
        onPress={() => setVisible(prev => !prev)}
        textHover={'Shows top 3 products'}
        iconName={'food'}
        containerStyle={{ right: 20, bottom: 20 }}
      ></FloatingButton>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  topThreePopup: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    zIndex: 20,
    elevation: 20,
    backgroundColor: GlobalStyles.brandBackground,
    borderRadius: 10,
    padding: 10,
    width: 260
  }
})
